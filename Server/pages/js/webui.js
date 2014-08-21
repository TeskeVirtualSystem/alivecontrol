var LoadingBarStack	=	0;

var WebUI_Parameters	=	{
	diskPercentCritical		: 5,
	diskPercentWarning 		: 20,
	diskSmartOK				: ["PASSED"],
	diskSmartProblem		: ["FAIL"]
};

function isEmpty(str)	{
	return (!str || str.trim().length === 0)
}

function secondsToTime(secs)	{
    secs = Math.round(secs);
    var hours = Math.floor(secs / (60 * 60));
    var days = Math.floor(hours / 24);

    hours -= days * 24;

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    return obj = {
    	"d": days,
        "h": hours,
        "m": minutes,
        "s": seconds
    };
}
function toNotationUnit(value, base)	{
 	if(base == null || base == undefined)
 		base = 10;
    var units = [ 'y','z','a','f','p','n','u','m',' ', 'k','M','G','T','P','E','Z','Y'] ;
    var counter = 8;
    var div = 1.0;
    if(base == 10)	
    	div = 1000.0;
    else if(base == 2)	
    	div = 1024.0;
    else{
    	// TODO: Other bases, maybe?
    	console.log("Unsuported base!");
    	return null;
    }

    val = value > 0 ? value : -value
    if(val < 1)	{
        while(( val < 1.00) && !(counter == 0))	{
            counter = counter - 1;
            val = val * div;
        }
    }else{
        while(( val >= div ) && !(counter == 16))	{
            counter = counter + 1;
        	val = val / div;
        }
    }	
	return [ ( value > 0 ? val : -val) , units[counter]]   
}

function ShowLoadingBar()					{	
	LoadingBarStack++; 
	$("#loadingdiv").fadeIn();
	$("#refresh-icon").addClass("icon-refresh-animate");
};
function HideLoadingBar()					{	
	LoadingBarStack--; 
	if(LoadingBarStack==0)	{
		$("#loadingdiv").fadeOut();	
		setTimeout(function(){$("#refresh-icon").removeClass("icon-refresh-animate")},200);
	}
};
function ShowError(title,content,buttons)	{	ShowMessage(title,content,buttons,"btn-danger");		};
function ShowMessage(title,content,buttons,modalclass)	{	
	var btnhtml = "";
	buttons = buttons !== undefined ? buttons : [{"title":"Fechar","data-dismiss":"modal"}];
	if(modalclass !== undefined)
		$("#errormodalheader").attr("class", "modal-header "+modalclass);
	else
		$("#errormodalheader").attr("class", "modal-header btn-info");
	
	$("#errormodaltitle").html(title);
	$("#errormodalbody").html(content);
	for(var i in buttons)	{
		var btn = buttons[i];
		btnhtml += '<button type="button" class="btn '	+
			(btn.hasOwnProperty("class")?btn["class"]+"\" ":"btn-default \" ") + 
			(btn.hasOwnProperty("data-dismiss")?' data-dismiss="'+btn["data-dismiss"]+'" ':'')+
			' '+
			(btn.hasOwnProperty("onClick")?' onClick="'+btn["onClick"]:'')+
			'">'+btn["title"]+'</button>';
	}
	$("#errormodalfoot").html(btnhtml);
	$("#errormodal").modal('show');	
};


function SetLoggedUser()	{
	if(typeof(GetT("userdata")) == "object")	{
		    $("#uname").html(GetT("userdata").name);
		    $("#page-wrapper").fadeIn();
		    $("#menu").fadeIn();
		    $("#unloggedbar").hide(1, function() {$("#loggedbar").fadeIn();});
		    Page("dashboard");
		    LoadAlerts();
		    LoadTasks();
		    LoadWarnings();
		    LoadProblems();
		    LoadMachines();
		    if(GetT("userdata").level > 1)	
		    	$("#admin_li").fadeIn();
		    else
		    	$("#admin_li").hide();
	}else{
		    $("#page-wrapper").fadeOut();
		    $("#menu").fadeOut();
		    $("#loggedbar").hide(1, function() {$("#unloggedbar").fadeIn();});
		    $("#alertbar").fadeOut();
			$("#dashboardmachinebox").fadeOut();
	}
};

function LoadAlert(id)	{	Page("alert",id);	}

function HidePages()	{	
	$("#dashboard").hide();
	$("#machines").hide();
	$("#machine").hide();
	$("#twp_list").hide();
	$("#twp").hide();
	$("#admin").hide();

	$("#machines_li").removeClass("active");
	$("#dashboard_li").removeClass("active");
	$("#configuration_li").removeClass("active");
	$("#problems_li").removeClass("active");
	$("#warnings_li").removeClass("active");
	$("#tasks_li").removeClass("active");
	$("#admin_li").removeClass("active");
}


function Page(page, data)	{
	HidePages();
	switch(page)	{
		case "dashboard"	: 	$("#dashboard").fadeIn(); 	$("#dashboard_li").addClass("active"); 	break; 
		case "machines"		:  	$("#machines").fadeIn();  	$("#machines_li").addClass("active"); 	break;
		case "machine" 		:   LoadMachine(data);		 	$("#machines_li").addClass("active"); 	break; 
		case "tasks"		:
		case "warnings"		:
		case "problems"		: 	TWPLoad(page);				$("#"+page+"_li").addClass("active");		break; 	
		case "admin"		:   if(GetT("userdata").level > 1)	{
			$("#admin").fadeIn();
			$("#admin_li").addClass("active");
		}else
			ShowError("Você não tem autorização para isso!","Você não tem autorização para acessar esta página");
		break;
		default 			:	$("#dashboard").fadeIn(); 	$("#dashboard_li").addClass("active"); 	break; 
	}
}


function TWPLoad(page)	{
	var data = null;
	$("#twptablerows").html("");
	switch(page)	{
		case "tasks":
			data = GetT("tasks");
			$("#twp_list_title").html('<i class="fa fa-tasks"></i> Tarefas <small>Visão Geral</small>');
			break;
		case "warnings":
			data = GetT("warnings");
			$("#twp_list_title").html('<i class="fa fa-exclamation"></i> Avisos <small>Visão Geral</small>');
			break;
		case "problems":
			data = GetT("problems");
			$("#twp_list_title").html('<i class="fa fa-support"></i> Problemas <small>Visão Geral</small>');
			break;
	}
	if(data != null)	{
		for(var i in data)	{
			$("#twptablerows").append('<tr>\
				<td id="twp_user_'+data[i].uuid+'">'+data[i].from+'</td>\
				<td><a href="#" onClick="ShowTWP(\''+page+'\', \''+data[i].uuid+'\')">'+data[i].title+'</a></td>\
				<td>'+data[i].subtitle+'</td>\
				<td>'+(new Date(data[i].target)).toLocaleString()+'</td>\
			</tr>');
			GetUserName(data[i].from, data[i].uuid, function(name,extra)	{
				$("#twp_user_"+extra).html(name);
				console.log(extra, name);
			});
		}
		if(data.length == 0)
			$("#twptablerows").html("<tr><td colspan=3>Nenhum item</td></tr>");
		$("#twp_list").fadeIn();
	}else{
		HidePages();
		ShowError("Pagina inválida","Certifique-se de que está tentando acessar uma página válida.");
	}
}

function ShowTWP(type, uuid)	{
	var twpdata;
	HidePages();
	switch(type)	{
		case "tasks":
			var tasks = GetT("tasks");
			for(var i in tasks)	{
				if(tasks[i].uuid == uuid)	{
					$("#twp_title").html('<i class="fa fa-tasks"></i> '+tasks[i].subtitle+' <small id="twp_from">(Enviado por '+tasks[i].from+')</small>');
					GetUserName(tasks[i].from, null, function(name,extra)	{
						$("#twp_from").html('(Enviado por '+name+')');
					});
					$("#twp_message").html(tasks[i].message);
					$("#twp_type").val("Task");
					$("#twp_uuid").val(tasks[i].uuid);
					$("#twp").fadeIn();
					twpdata = tasks[i];
					break;
				}
			}
			if(twpdata == undefined)
				LoadPage("dashboard");
		break;
		case "warnings":
			var warnings = GetT("warnings");
			for(var i in warnings)	{
				if(warnings[i].uuid == uuid)	{
					$("#twp_title").html('<i class="fa fa-exclamation"></i> '+warnings[i].subtitle+' <small id="twp_from">(Enviado por '+warnings[i].from+')</small>');
					GetUserName(warnings[i].from, null, function(name,extra)	{
						$("#twp_from").html('(Enviado por '+name+')');
					});
					$("#twp_message").html(warnings[i].message);
					$("#twp_type").val("Warning");
					$("#twp_uuid").val(warnings[i].uuid);
					$("#twp").fadeIn();
					twpdata = warnings[i];
					break;
				}
			}
			if(twpdata == undefined)
				LoadPage("dashboard");
		break;
		case "problems":
			var problems = GetT("problems");
			for(var i in problems)	{
				if(problems[i].uuid == uuid)	{
					$("#twp_title").html('<i class="fa fa-support"></i> '+problems[i].subtitle+' <small id="twp_from">(Enviado por '+problems[i].from+')</small>');
					GetUserName(problems[i].from, null, function(name,extra)	{
						$("#twp_from").html('(Enviado por '+name+')');
					});
					$("#twp_message").html(problems[i].message);
					$("#twp_type").val("Problem");
					$("#twp_uuid").val(problems[i].uuid);
					$("#twp").fadeIn();
					twpdata = problems[i];
					break;
				}
			}
			if(twpdata == undefined)
				LoadPage("dashboard");
		break;
		default: LoadPage("dashboard");
	}
}

function RefreshWarnings()	{
	var warnings = GetT("warnings");
	if(Array.isArray(warnings) && warnings.length > 0)	{
		if(GetT("config").internals.max_twp_results <= warnings.length)
			$("#dashboardwarnings").html(warnings.length+"+");
		else
			$("#dashboardwarnings").html(warnings.length);
	}else
		$("#dashboardwarnings").html("0");
	
	$("#dashboardwarningbox").fadeIn();
}
function RefreshProblems()	{
	var problems = GetT("problems");
	if(Array.isArray(problems) && problems.length > 0)	{
		if(GetT("config").internals.max_twp_results <= problems.length)
			$("#dashboardproblems").html(problems.length+"+");
		else
			$("#dashboardproblems").html(problems.length);
	}else
		$("#dashboardproblems").html("0");
	
	$("#dashboardproblembox").fadeIn();
}
function RefreshTasks()		{
	var tasks = GetT("tasks");
	if(Array.isArray(tasks) && tasks.length > 0)	{
		if(GetT("config").internals.max_twp_results <= tasks.length)
			$("#dashboardtasks").html(tasks.length+"+");
		else
			$("#dashboardtasks").html(tasks.length);
	}else
		$("#dashboardtasks").html("0");
	
	$("#dashboardtaskbox").fadeIn();
}

function RefreshAlerts()	{
	$("#alertbox").empty();
	var alerts = GetT("alerts");
	if(Array.isArray(alerts) && alerts.length > 0)	{
		for(var i in alerts)	{
			var alert = alerts[i];
			$("#alertbox").append('<li><a href="#" onClick="LoadAlert("'+alert.id+'");">"'+alert.name+'" <span class="label label-"'+alert.badgelabel+'"">"'+alert.badge+'"</span></a></li>');
		}
		$("#alertbox").append("<li class=\"divider\"></li>");
		$("#alertbox").append("<li><a href=\"#\" onClick=\"Page('alerts');\">Ver todos</a></li>");
	}else
		$("#alertbox").append("<li><a href=\"#\">Nenhuma notificação</a></li>");
	
	$("#alertbar").fadeIn();
};

function RefreshMachines()	{
	/**
"uuid" : "9f11b6b0-2186-11e4-9899-87a11cc8ec22", 
"owneruuid" : "01f4c670-1e60-11e4-adca-7d832b816a3a", 
"name" : "HUE's machine", 
"processor" : "Intel(R) Core(TM) i7-3630QM CPU @ 2.40GHz", 
"total_memory" : 16404020000, 
"free_memory" : 667176000, 
"total_swap" : 8786940000, 
"free_swap" : 8786940000, 
"current_status" : 1, 
"uptime" : "1 days 0 hours 20 minutes 35 seconds", 
"lastupdate" : 1407782280601, 
	**/
	var machines = GetT("machines");
	$("#machinetablerows").html("");
	if(Array.isArray(machines) && machines.length > 0)	{
		$("#dashboardmachines").html(machines.length);
		for(var i in machines)	{
			$("#machinetablerows").append(BuildMachineLine(machines[i]));
		}
	}else
		$("#dashboardmachines").html("0");
	
	$("#dashboardmachinebox").fadeIn();
};

function UILoadMachine(uuid)	{
	var machines = GetT("machines");
	if(Array.isArray(machines) && machines.length > 0)	{
		for(var i in machines)	{
			if(machines[i].uuid == uuid)	{
				LoadMachine(machines[i]);
				break;
			}
		}
	}else{
		ShowError("Máquina inválida!", "Máquina inválida! Tente recarregar a página.");
		Page("dashboard");
	}
}

function BuildMachineLine(machine)	{
	// A table line with following columns: OS Image (32x32) - Name - Processor - Total Memory - Last update
	var output;
	if(machine.current_status == 1)
		output	 = "<tr class=\"success\">\n";
	else
		output	 = "<tr class=\"danger\">\n";

	var osimage = GetOSImageName(machine.os);
	var lastupdate = secondsToTime( (Date.now() - machine.lastupdate)/1000);
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
	var memory = toNotationUnit(machine.total_memory, 2);
	var memory10 = toNotationUnit(machine.total_memory, 10);

	output +=  '	<td><img src="img/os/'+osimage+'" width=32 height=32 id="os_image_'+machine.uuid+'"/></td>\n';
	output +=  '	<td><a href="#" onClick="UILoadMachine(\''+machine.uuid+'\')">'+machine.name+'</a></td>\n';
	output +=  '	<td>'+machine.processor+'</td>\n';
	output +=  '	<td>'+memory[0].toFixed(2)+' '+memory[1]+'iB ('+memory10[0].toFixed(0)+' '+memory10[1]+'B)</td>\n';
	output +=  '	<td>'+lastupdate+'</td>\n';

	output += "</tr>\n";
	return output;
}

function ResetMachineFields()	{
	$("#deviceslist").html('<li class="list-group-item">Carregando</li>');
	$("#ethernetstablerows").html('<td colspan=6>Carregando...</td>');
	$("#diskstablerows").html('<td colspan=8>Carregando...</td>');
	$("#mountstablerows").html('<td colspan=5>Carregando...</td>');
	$("#drbdtablerows").html('<td colspan=5>Carregando...</td>');
	$("#vmstablerows").html('<td colspan=6>Carregando...</td>');
}

function RefreshMachineDevices(data)	{
	$("#deviceslist").html("");
	for(var i in data)	
		$("#deviceslist").append('<li class="list-group-item">'+data[i].name+'</li>');
	if(data.length == 0)
		$("#deviceslist").html('<li class="list-group-item">Nenhum dispositivo PCI/PCI-e</li>');
}

function RefreshMachineEthernets(data)	{
	$("#ethernetstablerows").html("");
	for(var i in data)	{
		var rx = toNotationUnit(data[i].rxbytes, 2);
		var tx = toNotationUnit(data[i].txbytes, 2);
		$("#ethernetstablerows").append('\
			<tr>\
				<td>'+data[i].iface+'</td>\
				<td>'+data[i].address+'</td>\
				<td>'+data[i].broadcast+'</td>\
				<td>'+data[i].netmask+'</td>\
				<td>'+rx[0].toFixed(2)+' '+rx[1]+'iB</td>\
				<td>'+tx[0].toFixed(2)+' '+tx[1]+'iB</td>\
			</tr>\
		');
	}
	if(data.length == 0)
		$("#ethernetstablerows").html('<td colspan=6>Nenhum dispositivo de rede</td>');
}

function RefreshMachineDisks(data)	{
	$("#diskstablerows").html("");
	for(var i in data)	{
		var d 			= data[i];
		var capacity 	= toNotationUnit(d.capacity, 2);
		var capacity10 	= toNotationUnit(d.capacity, 10);
		var diskclass	= "";

		if(WebUI_Parameters.diskSmartOK.indexOf(d.diskstatus) > -1)
			diskclass = "success";
		else if(WebUI_Parameters.diskSmartProblem.indexOf(d.diskstatus) > -1)
			diskclass = "danger";

		$("#diskstablerows").append('\
			<tr class="'+diskclass+'">\
				<td>'+d.device+'</td>\
				<td>'+d.family+'</td>\
				<td>'+capacity[0].toFixed(2)+' '+capacity[1]+'iB ('+capacity10[0].toFixed(0)+' '+capacity10[1]+'B)</td>\
				<td>'+d.ontime+'</td>\
				<td>'+d.powercycles+'</td>\
				<td>'+d.readerrors+'</td>\
				<td>'+d.realocatedsectors+'</td>\
				<td>'+d.diskstatus+'</td>\
			</tr>\
		');
	}
	if(data.length == 0)
		$("#diskstablerows").html('<td colspan=8>Nenhum disco</td>');
}

function RefreshMachineMounts(data)	{
	$("#mountstablerows").html("");
	for(var i in data)	{
		var d 			= data[i];
		var used 	= toNotationUnit(d.used, 10);
		var free 	= toNotationUnit(d.free, 10);
		var size	= toNotationUnit(d.size, 10);
		var percent = 100*(d.free/d.size);
		var mountclass = "success";
		if(percent < WebUI_Parameters.diskPercentCritical)
			mountclass = "danger";
		else if(percent < WebUI_Parameters.diskPercentWarning)
			mountclass = "warning";

		$("#mountstablerows").append('\
			<tr class="'+mountclass+'">\
                <td>'+d.mountpoint+'</td>\
                <td>'+d.device+'</td>\
                <td>'+used[0].toFixed(2)+' '+used[1]+'B</td>\
                <td>'+free[0].toFixed(2)+' '+free[1]+'B</td>\
                <td>'+size[0].toFixed(2)+' '+size[1]+'B</td>\
			</tr>\
		');
	}
	if(data.length == 0)
		$("#mountstablerows").html('<td colspan=4>Nenhum ponto de montagem</td>');
}

function RefreshMachineMYSQLs(data)	{
	$("#mysqltablerows").html("");
	for(var i in data)	{
		var d 			= data[i];
		$("#mysqltablerows").append('\
			<tr>\
                <th>'+d.masterhost+'</th>\
                <th>'+d.masteruser+'</th>\
                <th>'+d.slavestate+'</th>\
                <th>'+((d.slaveiorunning>0)?"Funcionando":"Parado")+'</th>\
                <th>'+((d.slavesqlrunning>0)?"Funcionando":"Parado")+'</th>\
			</tr>\
		');
	}
	if(data.length == 0)
		$("#mysqltablerows").html('<td colspan=5>Nenhum Slave MySQL</td>');
}

function RefreshMachineDRBDs(data)	{
	$("#drbdtablerows").html("");
	$("#drbdinfo").html("Versão: "+data.version);
	for(var i in data.conn)	{
		var d 			= data.conn[i];
		$("#drbdtablerows").append('\
			<tr>\
				<th>'+d.connid+'</th>\
				<th>'+d.cs+'</th>\
				<th>'+d.ro+'</th>\
				<th>'+d.ds+'</th>\
				<th>'+d.ns+'</th>\
			</tr>\
		');
	}
	if(data.conn.length == 0)
		$("#drbdtablerows").html('<td colspan=5>Nenhum DRBD</td>');
}

function RefreshMachineVMs(data)	{
	$("#vmstablerows").html("");
	for(var i in data)	{
		var d 			= data[i];
		var status = "<font color=\"red\">PARADA</font>";
		switch(d.status)	{
			case 0: status = "<font color=\"red\">PARADA</font>"; break;
			case 1: status = "<font color=\"green\">RODANDO</font>"; break; 
			case 2: status = "<font color=\"green\">SALVANDO</font>"; break;
			case 3: status = "<font color=\"yellow\">SALVA</font>"; break;
			case 4: status = "<font color=\"red\">ABORTADA</font>"; break;
			default: status = "<font color=\"gray\">Desconhecido</font>"; break;
		}
		$("#vmstablerows").append('\
			<tr>\
				<th>'+d.guestos+'</th>\
				<th>'+d.name+'</th>\
				<th>'+d.memory+'</th>\
				<th>'+d.cpus+'</th>\
				<th>'+d.type+'</th>\
				<th>'+status+'</th>\
			</tr>\
		');
	}
	if(data.length == 0)
		$("#vmstablerows").html('<td colspan=6>Nenhuma máquina virtual</td>');
}

function labelFormatter(label, series) {
	return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;background-color:rgba(0,0,0,0.5);'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
}

function AddUser()	{
	var 	name 		= 	$("#admin_adduser_name").val(),
	 		username 	=	$("#admin_adduser_username").val(),
	 		password	=	$("#admin_adduser_password1").val(),
	 		passconf	=	$("#admin_adduser_password2").val(),
	 		userlevel	=	$("#admin_adduser_userlevel").val();
	
	var ok = !isEmpty(name) && !isEmpty(username) && !isEmpty(password) && !isEmpty(passconf) && (passconf == password) && !isEmpty(userlevel) ;
	
	console.log(ok);

	if(isEmpty(name))	
		$("#admin_adduser_name").addClass("label-danger");
	else
		$("#admin_adduser_name").removeClass("label-danger");

	if(isEmpty(username))	
		$("#admin_adduser_username").addClass("label-danger");
	else
		$("#admin_adduser_username").removeClass("label-danger");

	if(isEmpty(password))	
		$("#admin_adduser_password1").addClass("label-danger");
	else
		$("#admin_adduser_password1").removeClass("label-danger");

	if(isEmpty(passconf))	
		$("#admin_adduser_password2").addClass("label-danger");
	else
		$("#admin_adduser_password2").removeClass("label-danger");

	if(password != passconf)	{
		$("#admin_adduser_password1").addClass("label-danger");
		$("#admin_adduser_password2").addClass("label-danger");
	}

	if(isEmpty(userlevel))
		$("#admin_adduser_userlevel").addClass("label-danger");
	else
		$("#admin_adduser_userlevel").removeClass("label-danger");

	if(ok)	
		APIAddUser(username,name,password,userlevel);
}

function CleanAddUser()	{
	$("#admin_adduser_name").val("");
	$("#admin_adduser_username").val("");
	$("#admin_adduser_password1").val("");
	$("#admin_adduser_password2").val("");
	$("#admin_adduser_userlevel").val("");

	$("#admin_adduser_name").removeClass("label-danger");
	$("#admin_adduser_username").removeClass("label-danger");
	$("#admin_adduser_password1").removeClass("label-danger");
	$("#admin_adduser_password2").removeClass("label-danger");
	$("#admin_adduser_userlevel").removeClass("label-danger");

	$("#admin_adduser_save").removeAttr("disabled"); 
}