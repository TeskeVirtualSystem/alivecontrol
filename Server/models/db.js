var machine 		= require("./machine.js");
var user 			= require("./user.js");

var database = function(url)	{
	if(url == undefined)	
		url = "mongodb://localhost/test";

	this._mg 		= 	require('mongoose');
	this._mg.connect(url);

	this.mscheme 	=	machine.Schemas(this._mg);
	this.usrchema 	=	user.Schemas(this._mg);
	this.Users 		= 	this._mg.model("Users", 	this.usrchema.userSchema);
	this.Machines 	= 	this._mg.model("Machines", 	this.mscheme.machineSchema); 



	this.Devices	=	this._mg.model("Devices", 	this.mscheme.deviceSchema); 
	this.Ethernets	=	this._mg.model("Ethernets", this.mscheme.ethernetSchema); 
	this.Disks		=	this._mg.model("Disks", 	this.mscheme.diskSchema); 
	this.Mounts		=	this._mg.model("Mounts", 	this.mscheme.mountSchema); 
	this.DRBD 		=	this._mg.model("DRBD", 		this.mscheme.drbdSchema); 
	this.DRBDCONN	=	this._mg.model("DRBDCONN", 	this.mscheme.drbdconnSchema); 
	this.MYSQL		=	this._mg.model("MYSQL", 	this.mscheme.mysqlSchema); 
	return this;
};

database.prototype.GetMachines	=	function(cb)	{
	return this.Machines.find({}, cb);
};

database.prototype.CheckUserUUID	=	function(uuid, cb)	{
	this.Users.find({"uuid":uuid}, function(err, data)	{
		cb(data != null && data.length > 0);
	});
};	

database.prototype.CheckMachineUUID	=	function(uuid, cb)	{
	this.Machines.find({"uuid":uuid}, function(err, data)	{
		cb(data != null && data.length > 0);
	});
};

database.prototype.CheckDRBDUUID	=	function(uuid, cb)	{
	this.DRBD.find({"uuid":uuid}, function(err, data)	{
		cb(data != null && data.length > 0);
	});	
};

database.prototype.AddUser		=	function(username, password, name, cb)	{
	var user = new this.Users({"username":username,"name":name});
	user.GenUUID();
	user.SetPassword(password);
	user.save(cb);
	return user;
};

database.prototype.AddMachine	=	function(owneruuid, name, processor, total_memory, free_memory, total_swap, free_swap, current_status, uptime, cb)	{
	this.CheckUserUUID(owneruuid, function(ok)	{
		if(ok)	{
			var machine = new this.Machines({
			  owneruuid 		:   owneruuid,
			  name				:   name,
			  processor 		:   processor,
			  total_memory 	    :   total_memory, 
			  free_memory 	    :   free_memory, 
			  total_swap 	    :   total_swap, 
			  free_swap 	    :   free_swap, 
			  current_status    :   current_status,
			  uptime 	        :   uptime,
			  lastupdate		:   Date.now()
			});
			machine.GenUUID();
			machine.save(function(err)	{
				if(err)	cb(null, "Save error", err);
				cb(machine);
			});	
		}else
			cb(null,"User ("+owneruuid+" doesnt not exists.");
	}
};

database.prototype.AddDevice	=	function(machineuuid, name, type, cb)	{
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var device = new this.Devices({
				machineuuid			: machineuuid,
				name				: name,
				type				: type 
			});
			device.save(function(err)	{
				if(err)	cb(null, "Save error", err);
				cb(device);
			});	
		}else
			cb(null,"Machine ("+machineuuid+" doesnt not exists.");
	}
};

database.prototype.AddEthernet	=	function(machineuuid, iface, address, broadcast, netmask, rxbytes, txbytes, cb)	{
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var ethernet = new this.Ethernets({
				machineuuid			: machineuuid,
				iface				: iface,
				address				: address,
				broadcast			: broadcast,
				netmask				: netmask,
				txbytes				: txbytes,
				rxbytes				: rxbytes  
			});
			ethernet.save(function(err)	{
				if(err)	cb(null, "Save error", err);
				cb(ethernet);
			});	
		}else
			cb(null,"Machine ("+machineuuid+" doesnt not exists.");
	});
};

database.prototype.AddDisk	=	function(machineuuid, family, capacity, ontime, powercycles, readerrors, realocatedsectors, diskstatus, device, cb)	{
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var disk = new this.Disks({
				machineuuid			: machineuuid,
				family				: family,
				capacity			: capacity,
				ontime				: ontime,
				powercycles			: powercycles,
				readerrors			: readerrors,
				realocatedsectors	: realocatedsectors,
				diskstatus			: diskstatus,
				device 				: device
			});
			disk.save(function(err)	{
				if(err)	cb(null, "Save error", err);
				cb(disk);
			});	
		}else
			cb(null,"Machine ("+machineuuid+" doesnt not exists.");
	});
};

database.prototype.AddMount	=	function(machineuuid, mountpoint, device, used, free, size, cb)	{
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var mount = new this.Mounts({
				machineuuid			: machineuuid,
				mountpoint			: mountpoint,
				device 				: device,
				used				: used,
				free 				: free,
				size 				: size
			});
			mount.save(function(err)	{
				if(err)	cb(null, "Save error", err);
				cb(mount);
			});	
		}else
			cb(null,"Machine ("+machineuuid+" doesnt not exists.");
	});
};

database.prototype.AddDRBD	=	function(machineuuid, version, connections, cb)	{
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var drbd = new this.DRBD({
				machineuuid			: machineuuid,
				version				: version,
				connections			: connections 
			});
			drbd.GenUUID();
			drbd.save(function(err)	{
				if(err)	cb(null, "Save error", err);
				cb(drbd);
			});	
		}else
			cb(null,"Machine ("+machineuuid+" doesnt not exists.");
	});
};

database.prototype.AddDRBDCONN	=	function(drbduuid, connid, cs, ro, ds, ns, cb)	{
	this.CheckDRBDUUID(drbduuid, function(ok)	{
		if(ok)	{
			var drbd = new this.DRBDCONN({
				drbduuid			: drbduuid,
				connid				: connid,
				cs 					: cs,
				ro 					: ro,
				ds 					: ds,
				ns 					: ns
			});
			drbd.save(function(err)	{
				if(err)	cb(null, "Save error", err);
				cb(drbd);
			});	
		}else
			cb(null,"Machine ("+machineuuid+" doesnt not exists.");
	});
};

database.prototype.AddMYSQL	=	function(machineuuid, masterhost, masteruser, slavestate, salveiorunning, slavesqlrunning, cb)	{
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var mysql = new this.MYSQL({
				machineuuid			: machineuuid,
				masterhost			: masterhost,
				masteruser			: masteruser,
				slavestate			: slavestate,
				slaveiorunning		: slaveiorunning,
				slavesqlrunning		: slavesqlrunning  
			});
			mysql.save(function(err)	{
				if(err)	cb(null, "Save error", err);
				cb(mysql);
			});	
		}else
			cb(null,"Machine ("+machineuuid+" doesnt not exists.");
	});
}


exports.Database = database;