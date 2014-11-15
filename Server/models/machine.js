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
	  os				:   String, 
	  total_memory 	    :   Number, 
	  free_memory 	    :   Number, 
	  total_swap 	    :   Number, 
	  free_swap 	    :   Number, 
	  current_status    :   Number,
	  uptime 	        :   String,
	  lastupdate		:   Number, 
	  extras			: 	[{name:String, value:String}]
	});

	machineSchema.methods.findExtra			=	function(name)	{
		if(this.extras === undefined)
			return -1;
		for(var i in this.extras)	{
			if(this.extras[i].name == name)
				return i;
		}
		return -1;
	}

	machineSchema.methods.AddExtra			=	function(name, value, cb)	{
		if(this.findExtra(name) == -1)	{
			this.extras.push({"name":name,"value":value});
			this.save(function(err)	{
				if(cb)
					cb(!err, err);
			});
		}else
			if(cb)
				cb(false, "Already Exists");
	};

	machineSchema.methods.UpdateExtra			=	function(name, value, cb)	{
		var idx = this.findExtra(name);
		if(idx >= 0)	{
			this.extras[idx].value = value;
			this.save(function(err)	{
				if(cb)
					cb(!err, err);
			});
		}else
			this.AddExtra(name, value, cb);
	};

	machineSchema.methods.DelExtra			=	function(name, cb)	{
		var idx = this.findExtra(name);
		if(idx >= 0)	{
			this.extras.splice(idx,1);
			this.save(function(err)	{
				if(cb)
					cb(!err, err);
			});
		}else
			if(cb)
				cb(true);
	};

	machineSchema.methods.GenUUID          	= 	function()  	{  	this.uuid = uuid.v1();  };
	machineSchema.methods.CheckStatus		=	function()		{	return this.current_status >= 1; };
	machineSchema.methods.GetDevices		=	function(cb)	{	return this.model("Devices")	.find({"machineuuid":this.uuid}, cb); };
	machineSchema.methods.GetEthernets		=	function(cb)	{	return this.model("Ethernets")	.find({"machineuuid":this.uuid}, cb); }; 
	machineSchema.methods.GetDisks			=	function(cb)	{	return this.model("Disks")		.find({"machineuuid":this.uuid}, cb); };
	machineSchema.methods.GetMounts			=	function(cb)	{	return this.model("Mounts")		.find({"machineuuid":this.uuid}, cb); };
	machineSchema.methods.GetDRBDs			=	function(cb)	{	return this.model("DRBD")		.find({"machineuuid":this.uuid}, cb); };
	machineSchema.methods.GetMYSQLs			=	function(cb)	{	return this.model("MYSQL")		.find({"machineuuid":this.uuid}, cb); };
	machineSchema.methods.GetVMs			=	function(cb)	{	return this.model("VMS")		.find({"machineuuid":this.uuid}, cb); };
	machineSchema.methods.GetFolderGroups	=	function(cb)	{	return this.model("FolderGroup").find({"machineuuid":this.uuid}, cb); };
	machineSchema.methods.GetMailDomains	=	function(cb)	{	return this.model("MailDomain")	.find({"machineuuid":this.uuid}, cb); };

	/** Clean functions **/
	machineSchema.methods.CleanDevices		=	function(cb)	{
		var thisschema = this;
		this.GetDevices(function(err, data)	{
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
		this.GetEthernets(function(err, data)	{
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
		this.GetDisks(function(err, data)	{
			if(data.length > 0)		{
					data[0].remove(function (err, product) {
						thisschema.CleanDisks(cb);
					});
			}else
				cb();
		});
	};	
	machineSchema.methods.CleanMounts		=	function(cb)	{
		var thisschema = this;
		this.GetMounts(function(err, data)	{
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
		this.GetDRBDs(function(err, data)	{
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
		this.GetMYSQLs(function(err, data)	{
			if(data.length > 0)		{
					data[0].remove(function (err, product) {
						thisschema.CleanMYSQLs(cb);
					});
			}else
				cb();
		});
	};

	machineSchema.methods.CleanVMs		=	function(cb)	{
		var thisschema = this;
		this.GetVMs(function(err, data)	{
			if(data.length > 0)		{
					data[0].remove(function (err, product) {
						thisschema.CleanVMs(cb);
					});
			}else
				cb();
		});
	};

	machineSchema.methods.CleanFolderGroups	=	function(cb)	{
		var thisschema = this;
		this.GetFolderGroups(function(err, data)	{
			if(data.length > 0)		{
					data[0].remove(function (err, product) {
						thisschema.CleanFolderGroups(cb);
					});
			}else
				cb();
		});
	};

	machineSchema.methods.CleanMailDomain	=	function(cb)	{
		var thisschema = this;
		this.GetMailDomains(function(err, data)	{
			if(data.length > 0)		{
					data[0].remove(function (err, product) {
						thisschema.CleanMailDomain(cb);
					});
			}else
				cb();
		});
	};

	machineSchema.methods.CleanMachineData	=	function(cb)	{
		/** TODO: Better way to clean **/
		var thisschema = this;
		this.CleanDevices(function()	{
			//console.log("Cleaning Ethernets");
			thisschema.CleanEthernets(function()	{
				//console.log("Cleaning Disks");
				thisschema.CleanDisks(function()	{
					//console.log("Cleaning Mounts");
					thisschema.CleanMounts(function()	{
						thisschema.CleanDRBDs(function()	{
							//console.log("Cleaning MySQLs");
							thisschema.CleanMYSQLs(function()	{
								//console.log("Cleaning VMs");
								thisschema.CleanVMs(function()	{
									//console.log("Cleaning FolderGroups");
									thisschema.CleanFolderGroups(function() {
										//console.log("Cleaning MailDomains");
										thisschema.CleanMailDomain(function() {
											//console.log("Clean Finish");
											cb();
										});
									});
								});
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

	var vmSchema	= new Schema({
		machineuuid			: { type: String, index: true },
		name				: String,
		guestos				: String,
		memory 				: Number,
		cpus				: Number,
		type				: String,
		status 				: Number
	});

	drbdSchema.methods.GenUUID          	= 	function()  	{  	this.uuid = uuid.v1();  };
	drbdSchema.methods.GetConnections		=	function(cb)	{	return this.model("DRBDCONN")		.find({"drbduuid":this.uuid}, cb); };
	drbdSchema.methods.CleanConnections		=	function(cb)	{
		var thisschema = this;
		this.GetConnections(function(err, data)	{
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
	var folderGroupSchema = new Schema({
		machineuuid			: { type: String, index: true },
		name				: { type: String, index: true },
		description 		: String,
		folders 			: [
								{
									name				: String,
									size 				: Number,
									files 				: Number,
									folders 			: Number,
									free 				: Number 
								}
							] 
	});

	var mailDomainSchema = new Schema({
		machineuuid			: { type: String, index: true },
		domain 				: { type: String, index: true },
		name   				: String,
		mailboxes 			: [{username:String, size:Number}]
	})

	var ex = {};
	ex.machineSchema 		= 	machineSchema;
	ex.deviceSchema			=	deviceSchema;
	ex.ethernetSchema		=	ethernetSchema;
	ex.diskSchema			=	diskSchema;
	ex.mountSchema			=	mountSchema;
	ex.drbdSchema 			=	drbdSchema;
	ex.drbdconnSchema		=	drbdconnSchema;
	ex.mysqlSchema			=	mysqlSchema;
	ex.vmSchema				=	vmSchema;
	ex.folderGroupSchema 	=	folderGroupSchema;
	ex.mailDomainSchema		=	mailDomainSchema;
	return ex;
};
/*
*/