var express 		= 	require('express');
var app				= 	express();
var cookieParser 	= 	require('cookie-parser');
var bodyParser 		= 	require('body-parser');
var fs 				= 	require('fs');

var http        	=   require('http');
var https 			= 	require('https');
var httpserver  	=   http.createServer(app);

var _db_			=	require("./models/db.js");
var apiman          =   require("./apimanager.js");
var _page_          =   require("./pagemanager.js");
var _control_       =   require("./control.js");
var config          =   require("./includes/config.js").cfg;

var db              =   new _db_.Database(config.internals.mongodb, config);


app.use(cookieParser("secret"));
app.use(bodyParser());
app.set('view engine', 'ejs');


var control         =   new _control_.control(db,app,config);
var api             =   new apiman.api(db,app, config, control);
var page            =   new _page_.page(db,app,config);

function doShutdown()	{
	control.Shutdown();
}

// listen for TERM signal .e.g. kill 
process.on ('SIGTERM', doShutdown);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', doShutdown); 

httpserver.listen(config.webserver.httpport);
app._htserv = httpserver;

if(config.webserver.httpsenable)	{
	var ca = [];
	if(config.webserver.hasOwnProperty("cabundle"))	{
		var chain = fs.readFileSync(config.webserver.cabundle, 'utf8');

		chain = chain.split("\n");
		var cert = [];

		for (_i = 0, _len = chain.length; _i < _len; _i++) {
			line = chain[_i];
			if (!(line.length !== 0)) {
				continue;
			}
			cert.push(line);
			if (line.match(/-END CERTIFICATE-/)) {
				ca.push(cert.join("\n"));
				cert = [];
			}
		}
	}
	httpsOptions = {
		ca: ca,
		key: fs.readFileSync(config.webserver.httpskey),
		cert: fs.readFileSync(config.webserver.httpscert)
	};
	var httpsServer = https.createServer(httpsOptions, app);

	httpsServer.listen(config.webserver.httpsport);
}