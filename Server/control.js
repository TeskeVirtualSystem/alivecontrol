
var Timings	=	{
	"CheckSession"	: 10 * 60 * 1000,	//	10 minutes interval per session check 
}

var control = function(database, app)	{
	this.db 	= 	database;
	this.app 	= 	app;

	this._CheckSessionAction();
}


control.prototype._CheckSessionAction	=	function()	{
	console.log("Session Check Schedule Start");
	this.db.CheckSessions(function()	{
		console.log("Session Check Schedule End");
		setTimeout(this._CheckSessionAction, Timings.CheckSession);
	});
}

exports.control = control;