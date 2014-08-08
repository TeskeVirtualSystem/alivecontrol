var express 			  = 	require('express');
var app					    = 	express();
var cookieParser 		= 	require('cookie-parser');
var bodyParser 			= 	require('body-parser');


var http        		=   require('http');
var httpserver  		=   http.createServer(app);

var _db_				    =	  require("./models/db.js");
var db 					    = 	new _db_.Database();
var apiman          =   requre("./apimanager.js");
var api             =   new apiman.api(db,app);

console.log(db);

app.use(cookieParser("secret"));
app.use(bodyParser());
app.set('view engine', 'ejs');


app.get('/login', 	loginGet);
app.post('/login', 	loginPost);
app.get('/adduser', adduserGet);
app.post('/adduser', adduserPost);

app.use("/js", express.static(__dirname + "/pages/js"));
app.use("/img", express.static(__dirname + "/pages/img"));
app.use("/css", express.static(__dirname + "/pages/css"));

function adduserGet(req, res)	{
	res.render('adduser');
}

function adduserPost(req, res)	{
	db.AddUser(req.body.username, req.body.password, req.body.name, function(data, err)	{
		if(data != null)	{
			console.log(data);
			res.redirect("/adduser");
		}else{
			console.log("Error adding user ("+req.body.username+","+req.body.password+","+req.body.name+")");
		}
	});
}

function loginGet(req, res){
  if(req.cookies.sessionkey){
    // already logged in
    res.redirect('/');
  } else {
    res.render('login',{"message":""});
  }
}


function loginPost(req, res, next) {
  console.log(req.body);
  db.TestLogin(req.body.username, req.body.password, function(ok, user)	{
  	if(ok)	{
  		res.render('logged',{"username":user.name});
  	}else{
    	res.render('login',{ message: "Invalid username or password!"});
  	}
  });
}


httpserver.listen(82);