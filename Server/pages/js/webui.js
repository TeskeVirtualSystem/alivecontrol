var LoadingBarStack	=	0;

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

function ShowLoadingBar()					{	LoadingBarStack++; $("#loadingdiv").fadeIn();							};
function HideLoadingBar()					{	LoadingBarStack--; if(LoadingBarStack==0)$("#loadingdiv").fadeOut();	};
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
}


function Page(page, data)	{
	HidePages();
	switch(page)	{
		case "dashboard"	: 	$("#dashboard").fadeIn(); 		break; 
		case "machines"		:  	$("#machines").fadeIn(); 		break;
		case "machine" 		:   LoadMachine(data);				break; 
		default 			:	$("#dashboard").fadeIn(); 		break; 
	}
}

function RefreshWarnings()	{
	var warnings = GetT("warnings");
	if(Array.isArray(warnings) && warnings.length > 0)	{
		$("#dashboardwarnings").html(warnings.length);
	}else
		$("#dashboardwarnings").html("0");
	
	$("#dashboardwarningbox").fadeIn();
}
function RefreshProblems()	{
	var problems = GetT("problems");
	if(Array.isArray(problems) && problems.length > 0)	{
		$("#dashboardproblems").html(problems.length);
	}else
		$("#dashboardproblems").html("0");
	
	$("#dashboardproblembox").fadeIn();
}
function RefreshTasks()		{
	var tasks = GetT("tasks");
	if(Array.isArray(tasks) && tasks.length > 0)	{
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

function BuildMachineLine(machine)	{
	// A table line with following columns: OS Image (32x32) - Name - Processor - Total Memory - Last update
	var output;
	if(machine.current_status == 1)
		output	 = "<tr class=\"success\">\n";
	else
		output	 = "<tr class=\"danger\">\n";

	var osimage = "os_other";
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

	output +=  '	<td><img src="img/os/'+osimage+'.png" width=32 height=32 id="os_image_'+machine.uuid+'"/></td>\n';
	output +=  '	<td>'+machine.name+'</td>\n';
	output +=  '	<td>'+machine.processor+'</td>\n';
	output +=  '	<td>'+memory[0].toFixed(2)+' '+memory[1]+'iB ('+memory10[0].toFixed(0)+' '+memory10[1]+'B)</td>\n';
	output +=  '	<td>'+lastupdate+'</td>\n';

	output += "</tr>\n";
	return output;
}

function RefreshMachineDevices(data)	{

}

function RefreshMachineEthernets(data)	{

}

function RefreshMachineDisks(data)	{

}

function RefreshMachineMounts(data)	{

}

function RefreshMachineMYSQLs(data)	{

}

function RefreshMachineDRBDs(data)	{

}

function RefreshMachineVMs(data)	{
	
}