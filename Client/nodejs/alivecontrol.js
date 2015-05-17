var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
var request = require('request');

var alivecontrol	=	function(url)	{
	this.url = url;
};

alivecontrol.prototype._CallAPI			=	function(method, data, cb)	{
	var log = this.url+"/api/" + method;
	request.post(
	    log,
	    data,
	    function (error, response, body) {
	        if (!error && response.statusCode == 200) {
	            cb(true, body);
	    	}else{
            	console.log("Error calling API: "+error);
	        	console.log(body);
            	cb(false,body, error);	
			}
	    }
	);
}

alivecontrol.prototype.login	=	function(username, password, maxdays, cb)	{
	this._CallAPI("login", { form: { username: username, password: password, maxdays: maxdays }}, function(ok, body, error)	{
		if(ok)	{
            var data = JSON.parse(body);
            if(data.status == "OK")	
            	cb(true, data.sessionkey, data.uuid);
            else{
            	console.log("Error trying to login: "+error);
            	cb(false);
			}
		}else{
        	console.log("Error trying to login: "+error);
        	cb(false);				
		}
	});
};

alivecontrol.prototype.logout	=	function(sessionkey, cb)	{
	this._CallAPI("logout", { form: { sessionkey: sessionkey } }, function(ok, body, error)	{
		if(ok)	{
            var data = JSON.parse(body);
            if(data.status == "OK")	
            	cb(true);
            else{
            	console.log("Error trying to logout: "+error);
            	cb(false);
			}
    	}else{
        	console.log("Error trying to logout: "+error);
        	cb(false);	
		}
	});
}

alivecontrol.prototype.updatemachine	=	function(machinedata, sessionkey, cb)	{
	this._CallAPI("updatemachine", { form: { sessionkey: sessionkey, machinedata : JSON.stringify(machinedata) } }, function(ok, body, error)	{
		if(ok)	{
            var data = JSON.parse(body);
            if(data.status == "OK")	
            	cb(true, data.machineuuid);
            else{
            	console.log("Error trying to update machine: "+error);
            	cb(false);
			}
    	}else{
        	console.log("Error trying to update machine: "+error);
        	cb(false);	
		}
	});
}


alivecontrol.prototype.updatedevices	=	function(machineuuid, devices, sessionkey, cb)		{
	this._CallAPI("updatedevices",  { form: { sessionkey: sessionkey, devices : devices, machineuuid : machineuuid  } }, function(ok, body, error)	{
		if(ok)	{
            var data = JSON.parse(body);
			cb(data.status == "OK");
		}else
			cb(false);
	});
}

alivecontrol.prototype.updateethernets	=	function(machineuuid, ethernets, sessionkey, cb)	{
	this._CallAPI("updateethernets",  { form: { sessionkey: sessionkey, ethernets : ethernets, machineuuid : machineuuid } }, cb);
}

alivecontrol.prototype.updatedisks		=	function(machineuuid, disks, sessionkey, cb)		{
	this._CallAPI("updatedisks",  { form: { sessionkey: sessionkey, disks : disks, machineuuid : machineuuid } }, function(ok, body, error)	{
		if(ok)	{
            var data = JSON.parse(body);
			cb(data.status == "OK");
		}else
			cb(false);
	});
}

alivecontrol.prototype.updatemounts		=	function(machineuuid, mounts, sessionkey, cb)		{
	this._CallAPI("updatemounts",  { form: { sessionkey: sessionkey, mounts : mounts, machineuuid : machineuuid } }, function(ok, body, error)	{
		if(ok)	{
            var data = JSON.parse(body);
			cb(data.status == "OK");
		}else
			cb(false);
	});
}

alivecontrol.prototype.updatemysqls		=	function(machineuuid, mysqls, sessionkey, cb)		{
	this._CallAPI("updatemysqls",  { form: { sessionkey: sessionkey, mysqls : mysqls, machineuuid : machineuuid } }, function(ok, body, error)	{
		if(ok)	{
            var data = JSON.parse(body);
			cb(data.status == "OK");
		}else
			cb(false);
	});
}

alivecontrol.prototype.updatedrbds		=	function(machineuuid, drbds, sessionkey, cb)		{
	this._CallAPI("updatedrbds",  { form: { sessionkey: sessionkey, drbds : drbds, machineuuid : machineuuid } }, function(ok, body, error)	{
		if(ok)	{
            var data = JSON.parse(body);
			cb(data.status == "OK");
		}else
			cb(false);
	});
}

alivecontrol.prototype.vms				=	function(machineuuid, vms, sessionkey, cb)			{
	this._CallAPI("updatevms",  { form: { sessionkey: sessionkey, vms : vms, machineuuid : machineuuid } }, function(ok, body, error)	{
		if(ok)	{
            var data = JSON.parse(body);
			cb(data.status == "OK");
		}else
			cb(false);
	});
}

alivecontrol.prototype.updatestate	=	function(machineuuid, status, sessionkey, cb)		{
	this._CallAPI("updatestate",  { form: { sessionkey: sessionkey, mstatus : status, machineuuid : machineuuid  } }, function(ok, body, error)	{
		if(ok)	{
            var data = JSON.parse(body);
			cb(data.status == "OK");
		}else
			cb(false);
	});
}

exports.alivecontrol = alivecontrol;

