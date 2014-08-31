var uuid          	= 	require('node-uuid');
var ejs 			= 	require('ejs');
var fs 				= 	require('fs')
var Timings	=	{}

var TemplateList	=	[
	"diskspacemessage",
	"smartmessage"
];

var control = function(database, app, config)	{
	this.db 	= 	database;
	this.app 	= 	app;
	this.config	=	config;
	this.tpl    = 	{};
	Timings 	=	config.internals.timings;
	
	console.log("Initializing Control Manager");

	this._LoadTemplates();
	this._CheckSystemUser();
	this._CheckSessionAction();
	this._CheckDiskSpaces();
	this._CheckAlive();
	this._CheckSMART();
}

control.prototype._LoadTemplates		=	function()	{
	console.log(TemplateList.length+" templates to load.");
	for(var i in TemplateList)	{
		var tplname = TemplateList[i];
		try	{
			var tpl = fs.readFileSync(__dirname + '/views/'+tplname+'.ejs', 'utf8');
			TemplateList[tplname] = tpl;
		}catch(e)	{
			console.log("Cannot load "+tplname+": "+e);
		}
	}
}

control.prototype._CheckAlive			=	function()	{
	var _this = this;
	console.log("Machine Alive Check Started");
	this.db.GetMachines(function(err, data)	{
		if(err)	{
			console.log("Error on CheckAlive: ",err);
		}else{
			var mc = 0;
			for(var i in data)	{
				if(Date.now() - data[i].lastupdate > Timings.MachineDead)	{
					data[i].current_status = 0;
					data[i].save();
					mc++;
				}
			}
			console.log(mc+" machines are dead.");
		}
		console.log("Machine Alive Check Ended");
		setTimeout(function() {_this._CheckAlive()}, Timings.CheckAlive);
	});
}

control.prototype._CheckSMART			=	function()	{
	var db = this.db;
	var _this = this;
	console.log("SMART Check Started");
	db.Disks.find({"diskstatus":"FAILED"}, function(err, sdata) {
		if(err) console.log("Error finding SMARTs: ",err);
		else{
			for(var i in sdata)	{
				var disk = sdata[i];
				db.GetMachine(disk.machineuuid, function(err, data) {
					if(err) console.log("Error finding machine: ",err);
					else	_this._DoSMARTReport(disk, data);
				});
			}
			console.log("SMART Check Ended");
		}
		setTimeout(function() {_this._CheckSMART();}, Timings.SMARTCheck);
	});
}

control.prototype._CheckSessionAction	=	function()	{
	var _this = this;
	console.log("Session Check Schedule Start");
	this.db.CheckSessions(function()	{
		console.log("Session Check Schedule End");
		setTimeout(function() {_this._CheckSessionAction();}, Timings.CheckSession);
	});
}

control.prototype._CheckSystemUser		=	function()	{
	var control = this;
	console.log("Checking for System User");
	this.db.Users.findOne({"uuid":"SYSTEM_USER"}, function(err, data)	{
		if(data == null)	{
			console.log("System User not found. Creating...");
			control._AddSystemUser();
		}else{
			console.log("System User found...");
		}
	});
}

control.prototype._AddSystemUser		=	function()	{
	var user = new this.db.Users({"uuid":"SYSTEM_USER","username":"tvsmonitor","name":"Monitor TVS", "level":6});
	user.SetPassword(uuid.v4()+uuid.v4());
	user.save(function(err)	{
		if(err)	
			console.log("Error Saving System user. CRITICAL");
		else
			console.log("System User created!");
	});
}

control.prototype._CheckDiskSpaces		=	function()	{
	var _this = this;
	this.db.Mounts.find({}, function(err, data) {
		if(err)
			console.log("Error in CheckDiskSpaces: "+err);
		else{
			for(var i in data)	{
				var percentFree = 100 * (data[i].free / data[i].size);
				if(percentFree <= _this.config.diskspace.critical)
					_this._DoDiskSpaceReport(data[i], 2);
				else if(percentFree <= _this.config.diskspace.warning)
					_this._DoDiskSpaceReport(data[i], 1);
			}
		}
		setTimeout(function()	{
			_this._CheckDiskSpaces();
		}, Timings.CheckDisk);
	});
}

control.prototype._DoDiskSpaceReport	=	function(data, level)	{
	var _this = this;
	this.db.GetMachine(data.machineuuid, function(err, mdata){
		if(data != null)	{
			if(level == 0)			{	//	Reserved for future use
				// TODO: Nothing for now, we wont use it for now.
			}else if(level == 1)	{	//	Warning
				var message = ejs.render(TemplateList["diskspacemessage"], {"mdata":mdata,"data":data,"config":_this.config,"diskminpercent":_this.config.diskspace.warning});
				var report = new _this.db.Warnings({
				    target    : Date.now(),
				    title     : "Espaço insuficiente",
				    subtitle  : "Espaço em disco insuficiente em "+data.mountpoint,
				    level     : 1,
				    message   : message,
				    from      : "SYSTEM_USER",
				    to        : mdata.owneruuid,
				    solved    : false
				});
				/*
				report.GenUUID();
				report.save(function(err)	{
					if(err)	
						console.log("Save error for disk space report: "+err);
					else
						console.log("Report added.");
				});
				*/
				_this._SendReport(report, _this.db.Warnings);
			}else if(level == 2)	{	//	Problem
				var message = ejs.render(TemplateList["diskspacemessage"], {"mdata":mdata,"data":data,"config":_this.config,"diskminpercent":_this.config.diskspace.critical});
				var report = new _this.db.Problems({
				    target    : Date.now(),
				    title     : "Espaço insuficiente",
				    subtitle  : "Espaço em disco insuficiente em "+data.mountpoint,
				    level     : 2,
				    message   : message,
				    from      : "SYSTEM_USER",
				    to        : mdata.owneruuid,
				    solved    : false
				});
				/*
				report.GenUUID();
				report.save(function(err)	{
					if(err)	
						console.log("Save error for disk space report: "+err);
					else
						console.log("Report added.");
				});
				*/
				_this._SendReport(report, _this.db.Problems);
			}
		}else{
			console.log("Error! Machine doesnt exists! Cleaning mount.");
			data.remove();
		}
	});
}

control.prototype._DoSMARTReport	=	function(sdata, mdata)	{
	var _this = this;
	var message = ejs.render(TemplateList["smartmessage"], {"mdata":mdata,"data":sdata,"config":_this.config});
	var report = new _this.db.Problems({
	    target    : Date.now(),
	    title     : "Um disco está falhando!",
	    subtitle  : "Seu disco "+sdata.device+" está falhando!",
	    level     : 2,
	    message   : message,
	    from      : "SYSTEM_USER",
	    to        : mdata.owneruuid,
	    solved    : false
	});
	/*
	report.GenUUID();
	report.save(function(err)	{
		if(err)	
			console.log("Save error for smart report: "+err);
		else
			console.log("Report added.");
	});*/

	_this._SendReport(report, _this.db.Problems);
}

control.prototype._SendReport	=	function(rdata, type)	{
	var db = this.db;
	db.Users.find({}).or([{"level":{ $gt: 1 }},{"extras":rdata.to}]).exec(function(err, data) {
		if(err)	
			console.log("Error sending reports: "+err);
		else{
			var cc = [];
			for(var i in data)	{
				var user = data[i];
				if(user.uuid != "SYSTEM_USER")	
					cc.push(user.uuid);
			}
			var repo = new type(rdata);
			var uname = user.name;
			repo._id = db._mg.Types.ObjectId();
			repo.cc = cc;
			repo.GenUUID();
			repo.save(function(err)	{
				if(err) console.log("Error saving report: ",err);
			});
		}
	});
}

exports.control = control;