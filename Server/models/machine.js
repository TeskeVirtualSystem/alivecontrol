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
	
	/** Clean functions **/
	machineSchema.methods.CleanDevices		=	function(cb)	{
		var thisschema = this;
		this.GetDevices(function(data)	{
			if(data.length > 0)		{
					data[0].remove(function (err, product) {
						thisschema.CleanDevices(cb);
					});
			}else
				cb();
		});
	};
	machineSchema.methods.CleanEthernets	=	function(cb)	{
		var thisschema = this;
		this.GetEthernets(function(data)	{
			if(data.length > 0)		{
					data[0].remove(function (err, product) {
						thisschema.CleanEthernets(cb);
					});
			}else
				cb();
		});
	};
	machineSchema.methods.CleanDisks		=	function(cb)	{
		var thisschema = this;
		this.GetDisks(function(data)	{
			if(data.length > 0)		{
					data[0].remove(function (err, product) {
						thisschema.CleanDevices(cb);
					});
			}else
				cb();
		});
	};	
	machineSchema.methods.CleanMounts		=	function(cb)	{
		var thisschema = this;
		this.GetMounts(function(data)	{
			if(data.length > 0)		{
					data[0].remove(function (err, product) {
						thisschema.CleanMounts(cb);
					});
			}else
				cb();
		});
	};
	machineSchema.methods.CleanDRBDs		=	function(cb)	{
		var thisschema = this;
		this.GetDRBDs(function(data)	{
			if(data.length > 0)		{
					data[0].CleanConnections(function()	{			
						data[0].remove(function (err, product) {
							thisschema.CleanDRBDs(cb);
						});
					})
			}else
				cb();
		});
	};
	machineSchema.methods.CleanMYSQLs		=	function(cb)	{
		var thisschema = this;
		this.GetMYSQLs(function(data)	{
			if(data.length > 0)		{
					data[0].remove(function (err, product) {
						thisschema.CleanMYSQLs(cb);
					});
			}else
				cb();
		});
	}

	machineSchema.methods.CleanMachineData	=	function(cb)	{
		/** TODO: Better way to clean **/
		var thisschema = this;
		console.log("Cleaning Devices");
		this.CleanDevices(function()	{
			console.log("Cleaning Ethernets");
			thisschema.CleanEthernets(function()	{
				console.log("Cleaning Disks");
				thisschema.CleanDisks(function()	{
					console.log("Cleaning Mounts");
					thisschema.CleanMounts(function()	{
						thisschema.CleanDRBDs(function()	{
							console.log("Cleaning MySQLs");
							thisschema.CleanMYSQLs(function()	{
								console.log("Clean finish");
								cb();
							});
						});
					});
				});
			});
		});
	};

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
	drbdSchema.methods.GetConnections		=	function(cb)	{	return this.model("DRBDCONN")		.find({"drbduuid":this.uuid}, cb); };
	drbdSchema.methods.CleanConnections		=	function(cb)	{
		var thisschema = this;
		this.GetConnections(function(data)	{
			if(data.length > 0)		{
				data[0].remove(function (err, product) {
					thisschema.CleanConnections(cb);
				});
			}else
				cb();
		});
	};

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