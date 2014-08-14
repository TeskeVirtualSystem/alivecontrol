var express 	= 	require('express');
var oneDay		=	86400000;
var pagemanager = function(database, app, cfg)	{
	this.app	= 	app;
	this.db 	= 	database;
	this.cfg	=	cfg;

	this.basecfg	=	{
		"company_title"		: this.cfg.company_title,
		"page_logo"			: this.cfg.page_logo
	};

	var _this 	= 	this;

	app.use("/js", 		express.static(__dirname + "/pages/js", 	{ maxAge: oneDay })		);
	app.use("/img", 	express.static(__dirname + "/pages/img",	{ maxAge: oneDay })		);
	app.use("/css", 	express.static(__dirname + "/pages/css",	{ maxAge: oneDay })		);
	app.use("/fonts", 	express.static(__dirname + "/pages/fonts",	{ maxAge: oneDay })		);

	app.get('/', 		function(r, q) { _this.page(r,q); }			);	
	app.post('/', 		function(r, q) { _this.page(r,q); }			);	
}


pagemanager.prototype.page 		=	function(req, res)	{
	res.render('main',this.basecfg);
}


exports.page = pagemanager;