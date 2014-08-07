var mongoose      = require('mongoose');
var uuid          = require('node-uuid');
var bcrypt        = require('bcryptjs');

exports.Schemas = function(mg)	{
	var Schema        = mg.Schema;
	var machineSchema = new Schema({
	  uuid      		:   { type: String, unique: true }, 
	  owneruuid 		:   String,
	  name				:   String,
	  processor 		:   String,
	  total_memory 	    :   Number, 
	  free_memory 	    :   Number, 
	  total_swap 	    :   Number, 
	  free_swap 	    :   Number, 
	  current_status    :   Number,
	  uptime 	        :   String,
	  lastupdate		:   Number, 
	});


	machineSchema.methods.GenUUID          	= 	function()  	{  	this.uuid = uuid.v1();  };
	machineSchema.methods.CheckStatus		=	function()		{	return this.current_status >= 1; };
	machineSchema.methods.GetDevices		=	function(cb)	{	return this.model("Devices")	.find({"machineuuid":this.uuid}, cb); };
	machineSchema.methods.GetEthernets		=	function(cb)	{	return this.model("Ethernets")	.find({"machineuuid":this.uuid}, cb); }; 
	machineSchema.methods.GetDisks			=	function(cb)	{	return this.model("Disks")		.find({"machineuuid":this.uuid}, cb); };
	machineSchema.methods.GetMounts			=	function(cb)	{	return this.model("Mounts")		.find({"machineuuid":this.uuid}, cb); };
	machineSchema.methods.GetDRBDs			=	function(cb)	{	return this.model("DRBD")		.find({"machineuuid":this.uuid}, cb); };
	machineSchema.methods.GetMYSQLs			=	function(cb)	{	return this.model("MYSQL")		.find({"machineuuid":this.uuid}, cb); };

	var deviceSchema = new Schema({
		machineuuid			: { type: String, index: true },
		name				: String,
		type				: String 
	});

	var ethernetSchema = new Schema({
		machineuuid			: { type: String, index: true },
		iface				: String,
		address				: String,
		broadcast			: String,
		netmask				: String,
		txbytes				: Number,
		rxbytes				: Number  
	});

	var diskSchema = new Schema({
		machineuuid			: { type: String, index: true },
		family				: String,
		capacity			: Number,
		ontime				: Number,
		powercycles			: Number,
		readerrors			: Number,
		realocatedsectors	: Number,
		diskstatus			: String,
		device 				: String
	});

	var mountSchema = new Schema({
		machineuuid			: { type: String, index: true },
		mountpoint			: String,
		device 				: String,
		used				: Number,
		free 				: Number,
		size 				: Number
	});

	var drbdSchema = new Schema({
		uuid 				: { type: String, unique: true },
		machineuuid			: String,
		version				: String,
		connections			: Number  
	});

	drbdSchema.methods.GenUUID          	= 	function()  	{  	this.uuid = uuid.v1();  };

	var drbdconnSchema = new Schema({
		drbduuid			: { type: String, index: true },
		connid				: Number,
		cs 					: String,
		ro 					: String,
		ds 					: String,
		ns 					: String
	});

	var mysqlSchema = new Schema({
		machineuuid 		: String,
		masterhost			: String,
		masteruser			: String,
		slavestate			: String,
		slaveiorunning		: Number,
		slavesqlrunning		: Number  
	});
	var ex = {};
	ex.machineSchema 		= 	machineSchema;
	ex.deviceSchema			=	deviceSchema;
	ex.ethernetSchema		=	ethernetSchema;
	ex.diskSchema			=	diskSchema;
	ex.mountSchema			=	mountSchema;
	ex.drbdSchema 			=	drbdSchema;
	ex.drbdconnSchema		=	drbdconnSchema;
	ex.mysqlSchema			=	mysqlSchema;
	return ex;
};
/*
*/