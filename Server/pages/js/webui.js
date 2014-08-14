var LoadingBarStack	=	0;

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

function LoadAlert(id)	{

}
function HidePages()	{	
	$("#dashboard").hide();
	$("#machines").hide();
}
function Page(page)	{
	HidePages();
	switch(page)	{
		case "dashboard": 	$("#dashboard").fadeIn(); 		break; 
		case "machines":  	$("#machines").fadeIn(); 		break;
		default:  			$("#dashboard").fadeIn(); 		break; 
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
	if(Array.isArray(machines) && machines.length > 0)	{
		$("#dashboardmachines").html(machines.length);
	}else
		$("#dashboardmachines").html("0");
	
	$("#dashboardmachinebox").fadeIn();
};