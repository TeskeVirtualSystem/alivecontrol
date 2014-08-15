var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
var request = require('request');

var alivecontrol	=	function(url)	{
	this.url = url;
};

alivecontrol.prototype.login	=	function(username, password, cb)	{
	var log = this.url+"/api/login";
	request.post(
	    log,
	    { form: { username: username, password: password, maxdays: 10 } },
	    function (error, response, body) {
	        if (!error && response.statusCode == 200) {
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
	    }
	);
};

alivecontrol.prototype.logout	=	function(sessionkey, cb)	{
	var log = this.url+"/api/logout";
	request.post(
	    log,
	    { form: { sessionkey: sessionkey } },
	    function (error, response, body) {
	        if (!error && response.statusCode == 200) {
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
	    }
	);
}

alivecontrol.prototype.updatemachine	=	function(machinedata, sessionkey, cb)	{
	var log = this.url+"/api/updatemachine";
	request.post(
	    log,
	    { form: { sessionkey: sessionkey, machinedata : JSON.stringify(machinedata) } },
	    function (error, response, body) {
	        if (!error && response.statusCode == 200) {
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
	    }
	);
}

exports.alivecontrol = alivecontrol;

