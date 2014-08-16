var uuid          = require('node-uuid');

var Timings	=	{
	"CheckSession"	: 10 * 60 * 1000,			//	10 minutes interval per session check 
	"CheckDisk"		: 24 * 60 * 60 * 1000,   	//  1 day interval per disk checks
}

var control = function(database, app, config)	{
	this.db 	= 	database;
	this.app 	= 	app;
	this.config	=	config;

	this._CheckSystemUser();
	this._CheckSessionAction();
	this._CheckDiskSpaces();
}


control.prototype._CheckSessionAction	=	function()	{
	console.log("Session Check Schedule Start");
	this.db.CheckSessions(function()	{
		console.log("Session Check Schedule End");
		setTimeout(this._CheckSessionAction, Timings.CheckSession);
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
					_this.DoDiskSpaceReport(data[i], 1);
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
				var report = new _this.db.Warnings({
				    target    : Date.now(),
				    title     : "Espaço insuficiente",
				    subtitle  : "Espaço em disco insuficiente em "+data.mountpoint,
				    level     : 1,
				    message   : "Seu disco "+data.mountpoint+" em "+mdata.name+" está com a capacidade abaixo de "+_this.config.diskspace.warning+"%",
				    from      : "SYSTEM_USER",
				    to        : mdata.owneruuid,
				    solved    : false
				});
				report.GenUUID();
				report.save(function(err)	{
					if(err)	
						console.log("Save error for disk space report: "+err);
					else
						console.log("Report added.");
				});
			}else if(level == 2)	{	//	Problem
				var report = new _this.db.Problems({
				    target    : Date.now(),
				    title     : "Espaço insuficiente",
				    subtitle  : "Espaço em disco insuficiente em "+data.mountpoint,
				    level     : 2,
				    message   : "Seu disco "+data.mountpoint+" em "+mdata.name+" está com a capacidade abaixo de "+_this.config.diskspace.critical+"%" +
				    			"<BR> Você está com "+data.free+" bytes livres diante de "+data.size+" bytes de espaço.",
				    from      : "SYSTEM_USER",
				    to        : mdata.owneruuid,
				    solved    : false
				});
				report.GenUUID();
				report.save(function(err)	{
					if(err)	
						console.log("Save error for disk space report: "+err);
					else
						console.log("Report added.");
				});
			}
		}else{
			console.log("Error! Machine doesnt exists! Cleaning mount.");
			data.remove();
		}
	});
}

exports.control = control;