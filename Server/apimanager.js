

var apimanager = function(database, app)	{
	console.log("Initializing API Manager")
	this.db 	= database;
	this.app 	= app;
	var _this = this;
	app.get("/api/"					,	function(r, q) { _this.apibase(r,q); });
	app.post("/api/"				,	function(r, q) { _this.apibase(r,q); });
	app.post("/api/login"			, 	function(r, q) { _this.login(r,q); });
	app.post("/api/logout"			, 	function(r, q) { _this.logout(r,q); });
	app.post("/api/updatemachine"	, 	function(r, q) { _this.updatemachine(r,q);});
	app.post("/api/adduser"			,	function(r, q) { _this.adduser(r,q); });
};

apimanager.prototype.apibase		=	function(req, res)	{
	res.json({"status":"NOK","code":"NO_COMMAND","error":"No Command"});
};

apimanager.prototype.adduser		=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, data)	{
		if(ok)	{
			data.GetUser(function(data)	{
				if(data.length > 0)	{
					if(data[0].level > 1)	{
						db.AddUser(req.body.add_username,req.body.add_password,req.body.add_name, function(data,msg,err)	{
							if(data != null)	
								res.json({"status":"OK","uuid":data.uuid});
							else
								res.json({"status":"NOK","code":"GENERIC_ERROR","error":msg});
						});
					}else
						res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});
				}else
					res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});
			});
		}else
			res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});
	});
};

apimanager.prototype.login			=	function(req, res)	{
	var db = this.db;
	db.TestLogin(req.body.username, req.body.password, function(ok, user)	{
		if(ok)	{
			db.CreateSession(user.uuid, req.body.level, req.body.maxdays, function(data, error)	{
				if(data != null)	{
					delete user.password;
					console.log(user);
					res.json({"status":"OK","sessionkey":data.sessionkey,"uuid":user.uuid,"userdata":user});
				}else{
					console.log("Session error: "+error);
					res.json({"error":error,"status":"NOK"});
				}
			});
		}else{
			res.json({"status":"NOK","code":"INVALID_USER","error":"Invalid username or password!"});
		}
	});
};

apimanager.prototype.checklogin		=	function(req, res)	{
	var db = this.db;
	if(req.body.hasOwnProperty("sessionkey"))	{
		db.CheckSession(req.body.sessionkey, function(ok, data)	{
			db.GetUser(data.useruuid, function(ok, udata)	{
				if(ok)	
					res.json({"status":"OK","data":udata});
				else{	//	Unlikely, but if so, there is a ghost session
					data.remove();
					res.json({"status":"NOK","code":"NOT_AUTHORIZED"});
				}
			});
		});
	}else
		res.json({"status":"NOK","code":"NOT_AUTHORIZED"});

}

apimanager.prototype.logout			=	function(req, res)	{
	var db = this.db;
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
					db.Machines.find({"uuid":machinedata.machineuuid}, function(err, data)	{
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
				res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"No Machine Data"});
		}else
			res.json({"status":"NOK","code":"NOT_AUTHORIZED", "error":"Not Authorized"});
	});
};


exports.api = apimanager;