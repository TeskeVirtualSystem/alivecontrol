var express 			  = 	require('express');
var app					    = 	express();
var cookieParser 		= 	require('cookie-parser');
var bodyParser 			= 	require('body-parser');


var http        		=   require('http');
var httpserver  		=   http.createServer(app);

var _db_				    =	  require("./models/db.js");
var apiman          =   require("./apimanager.js");
var _page_          =   require("./pagemanager.js");
var _control_       =   require("./control.js");
var config          =   require("./includes/config.js").cfg;

var db              =   new _db_.Database(config.internals.mongodb, config);

app.use(cookieParser("secret"));
app.use(bodyParser());
app.set('view engine', 'ejs');


var api             =   new apiman.api(db,app, config);
var page            =   new _page_.page(db,app,config);
var control         =   new _control_.control(db,app,config);

httpserver.listen(82);