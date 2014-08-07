var express 			= require('express');
var app					= express();
var passport        	= require("passport");
var LocalStrategy		= require('passport-local').Strategy;
var crypto				= require('crypto');
var bcrypt 				= require('bcryptjs');
var cookieParser 		= require('cookie-parser');
var bodyParser 			= require('body-parser')
var session				= require('cookie-session');


var http        =   require('http');
var httpserver  =   http.createServer(app);


function sha(data)					{	return crypto.createHash('sha1').digest("hex"); 	};
function pcompare(password, hash)	{	return bcrypt.compareSync(password, hash);			};
function pencrypt(password)			{	return bcrypt.hashSync(password,  8);				};

app.use(cookieParser());
app.use(bodyParser());
app.use(session({ secret: 'SECRET' }));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/alivecontrol');

var localUserSchema = new mongoose.Schema({
	username: String,
	hash: String
});

var Users = mongoose.model('userauths', localUserSchema);

passport.use(new LocalStrategy(
	{	usernameField	: "username",
		passwordField	: "password"
	},
	function(username, password,done){
	    Users.findOne({ username : username},function(err,user){
	        if(err) { return done(err); }
	        if(!user)
	            return done(null, false, { message: 'Incorrect username.' });
	        
	        if(pcompare(password, user.hash))	
	        	done(null, user);
	        else
	        	done(null, false, { message: "Incorrect Password"});
	    });
	})
);

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  // query the current user from database
  Users.find({username: username},	function(user){
        done(null, user);
    }, function(err){
        done(new Error('User ' + username + ' does not exist'));
    });
});

app.get('/login', loginGet);

function loginGet(req, res){
	console.log(req);
  if(req.user){
    // already logged in
    res.redirect('/');
  } else {
    // not logged in, show the login form, remember to pass the message
    // for displaying when error happens
    res.render('login', { message: req.session.messages });
    // and then remember to clear the message
    req.session.messages = null;
  }
}

app.post('/login', loginPost);

function loginPost(req, res, next) {
  // ask passport to authenticate
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      // if error happens
      return next(err);
    }
    
    if (!user) {
      // if authentication fail, get the error message that we set
      // from previous (info.message) step, assign it into to
      // req.session and redirect to the login page again to display
      req.session.messages = info.message;
      return res.redirect('/login');
    }

    // if everything's OK
    req.logIn(user, function(err) {
      if (err) {
        req.session.messages = "Error";
        return next(err);
      }

      // set the message
      req.session.messages = "Login successfully";
      return res.redirect('/admin');
    });
    
  })(req, res, next);
}

app.get('/logout', logout);

function logout(req, res){
  if(req.isAuthenticated()){
    req.logout();
    req.session.messages = req.i18n.__("Log out successfully");
  }
    res.redirect('/login');
}

app.get('/admin', requireAuth, adminHandler);

function requireAuth(req, res, next){
	console.log(req);

  // check if the user is logged in
  if(!req.isAuthenticated()){
    req.session.messages = "You need to login to view this page";
    res.redirect('/login');
  }
  next();
}

function adminHandler(req, res)	{
    // not logged in, show the login form, remember to pass the message
    // for displaying when error happens
    res.render('admin', { message: req.session.messages });
    // and then remember to clear the message
    req.session.messages = null;
}

httpserver.listen(82);