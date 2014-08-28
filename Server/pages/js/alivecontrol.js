var apiurl	=	window.location.origin+"/api";
console.log("API URL: "+apiurl);
var defaultMaxDays	=	1;

if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/gm, '');
	};
}

if(!String.prototype.replaceAll)	{
	String.prototype.replaceAll = function(find, replace) {
		  return this.replace(new RegExp(find, 'g'), replace);
	};
}
String.prototype.isEmpty	=	function()	{	return this.toString().trim() == "";	};

$(function() {	RefreshAll(); });

function DoLogin()			{	
	var username	=	$("#loginuser").val();
	var password	=	$("#loginpass").val();

	if(username == undefined || password == undefined || username.isEmpty() || password.isEmpty() )	{
		ShowError("Usuário ou senha em branco","Por favor, preencha os campos usuário e senha para efetuar o seu login.");
		return;
	}
	ShowLoadingBar();
	APIRequest("login",
		{
			"username"	: username,
			"password"	: password,
			"maxdays"	: defaultMaxDays
		},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log("Logged in as "+username);
				SetT("sessionkey",data.sessionkey);
				SetT("userdata", data.userdata);
				SetLoggedUser();
			}else
				ShowError("Usuário ou senha inválidos!","Por favor, confira seu usuário e senha, eles parecem inválidos.");
		}
	);
	LoadConfig();
};

function LoadAlerts()		{
	ShowLoadingBar();
	console.log("Carregando alertas.");
	APIRequest("loadalerts",{},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" alertas disponíveis.");
				SetT("alerts",data.data);
				RefreshAlerts();
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else
				console.error("Não foi possível carregar os alertas!");
		}
	);
}

function LoadTasks()		{
	ShowLoadingBar();
	console.log("Carregando tarefas.");
	APIRequest("loadtasks",{},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" tarefas disponíveis.");
				SetT("tasks",data.data);
				RefreshTasks();
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else
				console.error("Não foi possível carregar as tarefas!");
		}
	);
}

function LoadWarnings()		{
	ShowLoadingBar();
	console.log("Carregando Avisos.");
	APIRequest("loadwarnings",{},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" avisos disponíveis.");
				SetT("warnings",data.data);
				RefreshWarnings();
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else
				console.error("Não foi possível carregar os avisos!");
		}
	);
}

function LoadProblems()		{
	ShowLoadingBar();
	console.log("Carregando Problemas.");
	APIRequest("loadproblems",{},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" problemas disponíveis.");
				SetT("problems",data.data);
				RefreshProblems();
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else
				console.error("Não foi possível carregar os problemas!");
		}
	);
}

function LoadMachines()		{
	ShowLoadingBar();
	console.log("Carregando Máquinas.");
	APIRequest("loadmachines",{},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" maquinas carregadas.");
				SetT("machines",data.data);
				RefreshMachines();
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else
				console.error("Não foi possível carregar as maquinas!");
		}
	);
}

function LoadMachine(data)	{
	$("#machineos").html(data.os);
	$("#machinecpu").html(data.cpu);
	$("#machinehead").html('<i class="fa fa-desktop"></i> '+data.name+' <small>'+data.uuid+'</small>');
	var lastupdate = secondsToTime( (Date.now() - data.lastupdate)/1000);
	var lastupdate = (lastupdate.d > 0)	?	
	lastupdate.d+" dias atrás."	: 
	(
		(lastupdate.h > 0) ? 
			lastupdate.h + " horas atrás." :
			(
				(lastupdate.m > 0) ?
				lastupdate.m + " minutos atrás." :
				lastupdate.s + " segundos atrás "
			)

	) ;
	$("#machinelastupdate").html(lastupdate);
	switch(data.current_status)	{
		case 0: $("#machinestatus").html("<font color=\"red\">OFFLINE</font>"); break;
		case 1: $("#machinestatus").html("<font color=\"green\">ONLINE</font>"); break;
		default: $("#machinestatus").html("<font color=\"gray\">UNKNOWN ("+data.current_status+")</font>"); break;
	}
	$.plot("#ram-graph",  
		[
			{"label":"Livre","data":data.free_memory},
			{"label":"Usado","data":(data.total_memory-data.free_memory)}
		], 
		{
			series: {
				pie: { 
						show: true,
						radius: 1,
						label: {
							show: true,
							radius: 3/4,
							formatter: labelFormatter,
							background: { 
								opacity: 0.8,
								color: "#000000"
							}
						}
					}	
			},
			legend: {
				show: false
			}
		});
	$.plot("#swap-graph", 
		[
			{"label":"Livre","data":data.free_swap},  
			{"label":"Usado","data":(data.total_swap-data.free_swap)}
		],     
		{
			series: {
				pie: { 
						show: true,
						radius: 1,
						label: {
							show: true,
							radius: 3/4,
							formatter: labelFormatter,
							background: { 
								opacity: 0.8,
								color: "#000000"
							}
						}
					}	
			},
			legend: {
				show: false
			}
		});

	ResetMachineFields();
	$("#machine").fadeIn();
	$("#machines").hide();
	LoadMachineDevices(data.uuid);
	LoadMachineEthernets(data.uuid);
	LoadMachineDisks(data.uuid);
	LoadMachineMounts(data.uuid);
	LoadMachineDRBDs(data.uuid);
	LoadMachineMYSQLs(data.uuid);
	LoadMachineVMs(data.uuid);
}
function LoadMachineDevices(uuid)		{
	ShowLoadingBar();
	console.log("Carregando Dispositivos para "+uuid);
	APIRequest("loadmdevices",{"machineuuid":uuid},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" dispositivos carregadas.");
				RefreshMachineDevices(data.data);
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else if(data.status == "NOT_OWNER")	{
				console.error("Esta máquina não pertence a você!");
				ShowError("Esta máquina não percente a você!","Certifique-se de que a máquina correspondente pertença a você.");
				Page("dashboard");
			}else
				console.error("Não foi possível carregar as maquinas!");
		}
	);
}

function LoadConfig()	{
	ShowLoadingBar();
	console.log("Carregando configurações.");
	APIRequest("getconfig", {}, function(data)	{
		HideLoadingBar();	
		if(data.status == "OK")	{
			console.log("Configurações carregadas");
			SetT("config", data.data);
			WebUI_Parameters = data.data.WebUI_Parameters;
		}
	});
}

function GetUserName(uuid, extra, cb)	{
	ShowLoadingBar();
	console.log("Carregando nome para UUID: "+uuid);
	APIRequest("getusername", {"uuid":uuid}, function(data)	{
		HideLoadingBar();
		if(data.status == "OK")	{
			console.log("Nome de "+uuid+" é "+data.name);
			if(cb !== undefined)
				cb(data.name, extra);
		}else if(data.status == "NOT_AUTHORIZED")
			NotAuthorizedFallback();
		else{
			console.error("Não foi possível carregar o nome do usuário!");
			if(cb !== undefined, extra)
				cb("Desconhecido");
		}
	});
}

function LoadMachineEthernets(uuid)		{
	ShowLoadingBar();
	console.log("Carregando Dispositivos de Rede para "+uuid);
	APIRequest("loadmethernets",{"machineuuid":uuid},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" dispositivos de rede carregadas.");
				RefreshMachineEthernets(data.data);
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else if(data.status == "NOT_OWNER")	{
				console.error("Esta máquina não pertence a você!");
				ShowError("Esta máquina não percente a você!","Certifique-se de que a máquina correspondente pertença a você.");
				Page("dashboard");
			}else
				console.error("Não foi possível carregar as maquinas!");
		}
	);
}

function LoadMachineDisks(uuid)		{
	ShowLoadingBar();
	console.log("Carregando Discos para "+uuid);
	APIRequest("loadmdisks",{"machineuuid":uuid},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" discos carregados.");
				RefreshMachineDisks(data.data);
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else if(data.status == "NOT_OWNER")	{
				console.error("Esta máquina não pertence a você!");
				ShowError("Esta máquina não percente a você!","Certifique-se de que a máquina correspondente pertença a você.");
				Page("dashboard");
			}else
				console.error("Não foi possível carregar as maquinas!");
		}
	);
}

function LoadMachineMounts(uuid)		{
	ShowLoadingBar();
	console.log("Carregando Pontos de Montagem para "+uuid);
	APIRequest("loadmmounts",{"machineuuid":uuid},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" pontos de montagem carregados.");
				RefreshMachineMounts(data.data);
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else if(data.status == "NOT_OWNER")	{
				console.error("Esta máquina não pertence a você!");
				ShowError("Esta máquina não percente a você!","Certifique-se de que a máquina correspondente pertença a você.");
				Page("dashboard");
			}else
				console.error("Não foi possível carregar as maquinas!");
		}
	);
}

function LoadMachineDRBDs(uuid)		{
	ShowLoadingBar();
	console.log("Carregando Dispositivos DRBD para "+uuid);
	APIRequest("loadmdrbds",{"machineuuid":uuid},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.conns.length+" dispositivos DRBD carregados.");
				RefreshMachineDRBDs(data.data);
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else if(data.status == "NOT_OWNER")	{
				console.error("Esta máquina não pertence a você!");
				ShowError("Esta máquina não percente a você!","Certifique-se de que a máquina correspondente pertença a você.");
				Page("dashboard");
			}else
				console.error("Não foi possível carregar as maquinas!");
		}
	);
}

function LoadMachineMYSQLs(uuid)		{
	ShowLoadingBar();
	console.log("Carregando MySQLs para "+uuid);
	APIRequest("loadmmysqls",{"machineuuid":uuid},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" MySQLs carregados.");
				RefreshMachineMYSQLs(data.data);
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else if(data.status == "NOT_OWNER")	{
				console.error("Esta máquina não pertence a você!");
				ShowError("Esta máquina não percente a você!","Certifique-se de que a máquina correspondente pertença a você.");
				Page("dashboard");
			}else
				console.error("Não foi possível carregar as maquinas!");
		}
	);
}

function LoadMachineVMs(uuid)		{
	ShowLoadingBar();
	console.log("Carregando Máquinas Virtuais para "+uuid);
	APIRequest("loadmvms",{"machineuuid":uuid},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" máquinas virtuais carregadas.");
				RefreshMachineVMs(data.data);
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else if(data.status == "NOT_OWNER")	{
				console.error("Esta máquina não pertence a você!");
				ShowError("Esta máquina não percente a você!","Certifique-se de que a máquina correspondente pertença a você.");
				Page("dashboard");
			}else
				console.error("Não foi possível carregar as maquinas!");
		}
	);
}

function NotAuthorizedFallback()	{
	ClearT();
	SetLoggedUser();
}

function DoLogout()			{	
	ShowLoadingBar();
	APIRequest("logout",{},
		function(data)	{
			HideLoadingBar();
			console.log("Logged out");
			ClearT();
			SetLoggedUser();
			CleanAddUser();
		}
	);
};


function APIRequest(cmd,data,callback,error_callback)		{
	if(GetT("sessionkey") !== undefined)
		data.sessionkey = GetT("sessionkey");
	var compose = {"data":data,"callback":callback,"error_callback":error_callback};
	var _tvsapi = this;
	error_callback = error_callback === undefined ?	function(data,a,b)	{
		HideLoadingBar();
		if(data.readyState != 0)	{
			var code = btoa(JSON.stringify({"compose":compose,"error_data":data, "statusText": data.statusText, "allResponseHeaders":data.getAllResponseHeaders() }));
			ShowError("Houve um erro ao processar a requisição.","Desculpe! Houve um erro ao processar a sua requisição. Entregue o código abaixo a um administrador: <BR><BR> <B><div style=\"word-wrap: break-word;\">"+code+"</div></B>");
			if(console.error !== undefined)
				console.error("Desculpe! Houve um erro ao processar a sua requisição. Entregue o código abaixo a um administrador: "+code);
		}
	}	:	error_callback;
	$.ajax({
		type: "POST",
		url: apiurl+"/"+cmd,
		data: data,
		success: function(data)	{	
			if(data.hasOwnProperty("code") && data.code == "NOT_AUTHORIZED")	{
				HideLoadingBar();
				ShowError("Você não está autorizado a executar essa ação!","Desculpe, mas você não está autorizado a executar essa ação. Verifique se sua sessão não expirou. Atualize a pagina.");
			}else if(callback != undefined)
				callback(data);
		},
		error: error_callback,
		dataType: "json"
	});
}

var OSNames	=	[
	{"name":"archlinux","image":"archlinux"},
	{"name":"debian","image":"debian"},
	{"name":"fedora","image":"fedora"},
	{"name":"freebsd","image":"freebsd"},
	{"name":"gentoo","image":"gentoo"},
	{"name":"macosx","image":"macosx"},
	{"name":"mandriva","image":"ubuntu"},
	{"name":"netbsd","image":"netbsd"},
	{"name":"openbsd","image":"openbsd"},
	{"name":"opensuse","image":"opensuse"},
	{"name":"oracle","image":"oracle"},
	{"name":"solaris","image":"solaris"},
	{"name":"redhat","image":"redhat"},
	{"name":"turbolinux","image":"turbolinux"},
	{"name":"ubuntu","image":"ubuntu"},
	{"name":"windows 2003","image":"win2k3"},
	{"name":"windows 2000","image":"win2k"},
	{"name":"windows 2008","image":"win2k8"},
	{"name":"windows 2012","image":"win2k12"},
	{"name":"windows 7","image":"win7"},
	{"name":"windows 8","image":"win8"},
	{"name":"windows vista","image":"winvista"},
	{"name":"windows xp","image":"winxp"},
	{"name":"windows","image":"win_other"},
	{"name":"xandros","image":"xandros"},
	{"name":"linux","image":"linux"}
];

function GetOSImageName(os)	{
	if(os == undefined || os == null)
		return "os_other.png";
	var image 	= 	"os_";
	os 			=	os.toLowerCase();
	var	OK 		=	false;
	for(var i in OSNames)	{
		if(os.indexOf(OSNames[i].name) > -1)	{
			image += OSNames[i].image;
			OK = true;
			break;
		}
	}
	if(!OK)	
		image += "other";
	
	if(os.indexOf("x86_64") > -1 || os.indexOf("amd64") > -1 || os.indexOf("64 bit") > -1)
		image += "_64";
	image += ".png";

	return image;
}

function SetResolved()	{
	var type 		= 	$("#twp_type").val(),
		twpuuid		=	$("#twp_uuid").val();
	var cmd;

	$("#twp_mark_solved").attr("disabled", "disabled");
	switch(type)	{
		case "Task"		: cmd = "marksolvedtask"; 		break;
		case "Warning"	: cmd = "marksolvedwarning";	break;
		case "Problem"	: cmd = "marksolvedproblem";	break;
		default:	ShowError("Tipo inválido!","Você está tentando marcar como resolvido um tipo inválido de mensagem!");
	}
	if(cmd != undefined)	{
		ShowLoadingBar();
		APIRequest(cmd,{"twpuuid":twpuuid},function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				switch(type)	{
					case "Task"		: LoadTasks(); break;
					case "Warning"	: LoadWarnings(); break;
					case "Problem"  : LoadProblems(); break;
				}
				Page("dashboard");
			}else if(data.status == "NOT_AUTHORIZED")
				NotAuthorizedFallback();
			else if(data.status == "NOT_TO_YOU")	{
				console.error("Esta mensagem não é para você!");
				ShowError("Esta mensagem não é para você!","Certifique-se de que a mensagem esteja destinada a você.");
				Page("dashboard");
			}
			$("#twp_mark_solved").removeAttr("disabled"); 
		});
	}
}

function RefreshAll()	{
	console.log("Refreshing data");
	LoadConfig();
	if(GetT("userdata") !== undefined)	{
	    LoadAlerts();
	    LoadTasks();
	    LoadWarnings();
	    LoadProblems();
	    LoadMachines();
	}
	var delay = 5000;
	if(GetT("config") !== undefined)
		delay = GetT("config").internals.timings.refreshdata;
	console.log("Next refresh in "+(delay/1000)+" s");
	setTimeout(RefreshAll, delay);
}

function APIAddUser(username,name,password,userlevel)	{
	ShowLoadingBar();
	$("#admin_adduser_save").attr("disabled", "disabled");
	APIRequest("adduser", 
		{
			"add_username"		: username,
			"add_password"		: password,
			"add_name"			: name,
			"add_level"			: userlevel
		}, function(data)	{
			HideLoadingBar();
			$("#admin_adduser_save").removeAttr("disabled"); 
			console.log("HUE");
			if(data.status == "OK")	{
				Page("dashboard");
				CleanAddUser();
			}else{
				ShowError("Erro",data.error);
				console.error("Error adding user: ",data.error);
			}
		}
	);
}