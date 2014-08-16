var express 			  = 	require('express');
var app					    = 	express();
var cookieParser 		= 	require('cookie-parser');
var bodyParser 			= 	require('body-parser');


var http        		=   require('http');
var httpserver  		=   http.createServer(app);

var _db_				    =	  require("./models/db.js");
var db 					    = 	new _db_.Database();
var apiman          =   require("./apimanager.js");
var _page_          =   require("./pagemanager.js");
var _control_       =   require("./control.js");
var config          =   require("./includes/config.js").cfg;

app.use(cookieParser("secret"));
app.use(bodyParser());
app.set('view engine', 'ejs');


var api             =   new apiman.api(db,app);
var page            =   new _page_.page(db,app,config);
var control         =   new _control_.control(db,app);

httpserver.listen(82);