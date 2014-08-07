

var apimanager = function(database, app)	{
	this.db 	= database;
	this.app 	= app;

	app.get("/api/"					,	this.apibase);
	app.post("/api/"				,	this.apibase);
	app.post("/api/login"			, 	this.login);
	app.post("/api/logout"			, 	this.logout);
	app.post("/api/updatemachine"	, 	this.updatemachine);
};

apimanager.prototype.apibase		=	function(req, res)	{
	
};

apimanager.prototype.login			=	function(req, res)	{
	db.TestLogin(req.body.username, req.body.password, function(ok, user)	{
		if(ok)	{
			db.CreateSession(user.uuid, req.body.level, req.body.maxdays, function(data, error)	{
				if(data != null)	{
					res.json("status":"OK","sessionkey":data.sessionkey);
				}else{
					console.log("Session error: "+error);
					res.json({"error":error,"status":"NOK"});
				}
			});
		}else{
			res.render('login',{ message: "Invalid username or password!"});
		}
	});
};

apimanager.prototype.logout			=	function(req, res)	{
	db.CheckSession(req.body.sessionkey, function(ok, data)	{
		if(ok)
			data.remove();
		res.json({"status":"OK"});
	});
};

apimanager.prototype.updatemachine	=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, data)	{
		/** Checks if Session is Valid **/
		if(ok)	{
			var session = data;
			/** Checks if client sent the Machine Data **/
			if(req.body.hasOwnProperty("machinedata"))	{
				var machinedata = JSON.parse(req.body.machinedata);
				/** Sets owneruuid to session user **/
				machinedata.owneruuid = session.useruuid;
				/** Checks if its a new machine, or updating an older **/
				if(machinedata.machineuuid != null)	{
					/** If updating older, lets see if we can find the machineuuid and if its belongs to the session user **/
					db.Machines.find({"machineuuid":machinedata.machineuuid}, function(err, data)	{
						/** If we find, lets check the ownership **/
						if(data.length > 0)	{
							/** If belongs to the user, lets just update **/
							if(data[0].owneruuid == session.useruuid)
								db.UpdateMachine(data[0].uuid, machinedata, function(uuid, data) {
									res.json({"status":"OK","machineuuid":uuid});
								});
							else{
							/** If not, we create a new machine  and ignore the Machine UUID **/
								db.UpdateMachine(null, machinedata, function(uuid, data) {
									res.json({"status":"OK","machineuuid":uuid});
								});	
							}	
						/** If not, just create one and ignore the UUID **/		
						}else
							db.UpdateMachine(null, machinedata, function(uuid, data) {
								res.json({"status":"OK","machineuuid":uuid});
							});
					});
				/** If its new, just add it **/
				}else
					db.UpdateMachine(null, machinedata, function(uuid, data) {
						res.json({"status":"OK","machineuuid":uuid});
					});
			}else
				res.json({"status":"NOK","error":"No Machine Data"});
		}else
			res.json({"status":"NOK", "error":"Not Authorized"});
	});
};


exports.api = apimanager;