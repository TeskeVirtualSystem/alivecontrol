var apiurl	=	"http://localhost:82/api";
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

function LoadMachineDevices(uuid)		{
	ShowLoadingBar();
	console.log("Carregando Dispositivos para "+uuid);
	APIRequest("loadmdevices",{"uuid":machineuuid},
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

function LoadMachineEthernets(uuid)		{
	ShowLoadingBar();
	console.log("Carregando Dispositivos de Rede para "+uuid);
	APIRequest("loadmethernets",{"uuid":machineuuid},
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
	APIRequest("loadmedisks",{"uuid":machineuuid},
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
	APIRequest("loadmmounts",{"uuid":machineuuid},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" pontos de montagem carregados.");
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

function LoadMachineDRBDs(uuid)		{
	ShowLoadingBar();
	console.log("Carregando Dispositivos DRBD para "+uuid);
	APIRequest("loadmethernets",{"uuid":machineuuid},
		function(data)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				console.log(data.data.length+" dispositivos DRBD carregados.");
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
	APIRequest("loadmmysqls",{"uuid":machineuuid},
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
	APIRequest("loadmvms",{"uuid":machineuuid},
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
		}
	);
};

function LoadMachine(data)	{
	ShowLoadingBar();
	console.log("Carregando máquina "+data.uuid);
	APIRequest("loadmachine",{"machineuuid":data.uuid},
		function(mdata)	{
			HideLoadingBar();
			if(data.status == "OK")	{
				RefreshMachine(mdata.data);
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
		  if(data.hasOwnProperty("code") && data.code == "NOT_AUTHORIZED")
			 ShowError("Você não está autorizado a executar essa ação!","Desculpe, mas você não está autorizado a executar essa ação. Verifique se sua sessão não expirou. Atualize a pagina.");
		  else if(callback != undefined)
			  callback(data);
		},
		error: error_callback,
		dataType: "json"
	});
}

function LoadPage(page, cb)	{

}