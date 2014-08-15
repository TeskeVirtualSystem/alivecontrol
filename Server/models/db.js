var machine 		= require("./machine.js");
var user 			= require("./user.js");
var info			= require("./info.js");

var database = function(url)	{
	if(url == undefined)	
		url = "mongodb://localhost/test";

	this._mg 		= 	require('mongoose');
	this._mg.connect(url);

	this.mscheme 	=	machine.Schemas(this._mg);
	this.usrchema 	=	user.Schemas(this._mg);
	this.infoschema	=	info.Schemas(this._mg);

	this.Users 		= 	this._mg.model("Users", 	this.usrchema.userSchema);
	this.Machines 	= 	this._mg.model("Machines", 	this.mscheme.machineSchema); 
	this.Sessions	=	this._mg.model("Sessions",	this.usrchema.sessionSchema);
	this.Alerts		=	this._mg.model("Alerts",    this.infoschema.alertSchema);

	this.Warnings	=	this._mg.model("Warnings",	this.infoschema.TWPSchema);
	this.Tasks		=	this._mg.model("Tasks",		this.infoschema.TWPSchema);
	this.Problems	=	this._mg.model("Problems",	this.infoschema.TWPSchema);

	this.Devices	=	this._mg.model("Devices", 	this.mscheme.deviceSchema); 
	this.Ethernets	=	this._mg.model("Ethernets", this.mscheme.ethernetSchema); 
	this.Disks		=	this._mg.model("Disks", 	this.mscheme.diskSchema); 
	this.Mounts		=	this._mg.model("Mounts", 	this.mscheme.mountSchema); 
	this.DRBD 		=	this._mg.model("DRBD", 		this.mscheme.drbdSchema); 
	this.DRBDCONN	=	this._mg.model("DRBDCONN", 	this.mscheme.drbdconnSchema); 
	this.MYSQL		=	this._mg.model("MYSQL", 	this.mscheme.mysqlSchema); 
	this.VMS		=	this._mg.model("VMS", 		this.mscheme.vmSchema); 
	//return this;
};

database.prototype.CheckSessions	=	function()	{
	this.Sessions.find({}, function(err, data)	{
		for(var i in data)	{
			if(data.hasOwnProperty(i))	{
				if(!data[i].IsValid())
					data[i].remove();
			}
		}
	});
};

database.prototype.GetUnsolvedTasks	=	function(uuid, cb)	{
	return this.Tasks.find({}).where('solved', false).or([{"to":uuid},{"to":"ALL"}]).exec(cb);
}

database.prototype.GetUnsolvedProblems	=	function(uuid, cb)	{
	return this.Problems.find({}).where('solved', false).or([{"to":uuid},{"to":"ALL"}]).exec(cb);
}

database.prototype.GetUnsolvedWarnings	=	function(uuid, cb)	{
	return this.Warnings.find({}).where('solved', false).or([{"to":uuid},{"to":"ALL"}]).exec(cb);
}

database.prototype.GetAlerts		=	function(uuid, cb)	{
	return this.Alerts.find({}).or([{"to":uuid},{"to":"ALL"}]).exec(cb);
}

database.prototype.GetMachines	=	function(cb)	{
	return this.Machines.find({}, cb);
};

database.prototype.GetUserMachines	=	function(uuid, cb)	{
	return this.Machines.find({"owneruuid":uuid}, cb);
};

database.prototype.GetMachine 		=	function(uuid, cb)	{
	return this.Machines.findOne({"uuid":uuid}, cb);
};

database.prototype.CheckUserUUID	=	function(uuid, cb)	{
	this.Users.find({"uuid":uuid}, function(err, data)	{
		if(cb !== undefined) cb(data != null && data.length > 0);
	});
};	

database.prototype.CheckUsername	=	function(username, cb)	{
	this.Users.find({"username":username}, function(err, data)	{
		if(cb !== undefined) cb(data != null && data.length > 0);
	});	
};

database.prototype.GetUser			=	function(uuid, cb)		{
	this.Users.find({"uuid":uuid}, function(err, data)	{
		if(cb !== undefined)	{
			if(data.length >0)	{
				data[0].password = undefined;
				cb(true, data[0]);	
			}else 
				cb(false);
		}
	});
};

database.prototype.CheckMachineUUID	=	function(uuid, cb)	{
	this.Machines.find({"uuid":uuid}, function(err, data)	{
		if(cb !== undefined) cb(data != null && data.length > 0);
	});
};

database.prototype.CheckDRBDUUID	=	function(uuid, cb)	{
	this.DRBD.find({"uuid":uuid}, function(err, data)	{
		if(cb !== undefined) cb(data != null && data.length > 0);
	});	
};

database.prototype.AddUser		=	function(username, password, name, level, cb)	{
	this.CheckUsername(username, function(exists)	{
		if(exists)	
			if(cb !== undefined) cb(null, "Already exists");
		else{
			var user = new _this.Users({"username":username,"name":name, "level":level});
			user.GenUUID();
			user.SetPassword(password);
			user.save(function(err)	{
				if(err)	if(cb !== undefined) cb(null,"Save error", err);
				if(cb !== undefined) cb(user);
			});
		}
	});
};

database.prototype.TestLogin	=	function(username, password, cb)	{
	this.Users.find({"username":username}, function(err, data) {
		if(data.length > 0)	{
			if(data[0].ComparePassword(password))	{
				data[0].password = undefined;
				if(cb !== undefined) cb(true, data[0]);
			}else
				if(cb !== undefined) cb(false);
		}else
			if(cb !== undefined) cb(false);
	});
};

database.prototype.CheckSession =	function(sessionkey, cb)	{
	this.Sessions.find({"sessionkey":sessionkey}, function(err, data)	{
		if(data.length > 0)	{
			if(data[0].IsValid())	{
				if(cb !== undefined) cb(true, data[0]);
			}else{
				data[0].remove();
				if(cb !== undefined) cb(false);
			}
		}else
			if(cb !== undefined) cb(false);
	});
};

database.prototype.CreateSession=	function(useruuid, level, maxdays, cb)	{
	var _this = this;
	this.CheckUserUUID(useruuid, function(ok)	{
		if(ok)	{
			var session = new _this.Sessions({
				"useruuid"		: useruuid,
				"level"			: level,
				"maxdays"		: maxdays,
				"startdate"		: Date.now()
			});
			session.GenKey();
			session.save(function(err) 	{
				if(err) if(cb !== undefined) cb(null, "Save error", err);
				if(cb !== undefined) cb(session);
			});
		}else
			if(cb !== undefined) cb(null, "User ("+useruuid+") does not exists.");
	});
};

database.prototype.AddMachine	=	function(owneruuid, name, processor, total_memory, free_memory, total_swap, free_swap, current_status, uptime, cb)	{
	var _this = this;
	this.CheckUserUUID(owneruuid, function(ok)	{
		if(ok)	{
			var machine = new _this.Machines({
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
				if(err)	if(cb !== undefined) cb(null, "Save error", err);
				if(cb !== undefined) cb(machine);
			});	
		}else
			if(cb !== undefined) cb(null,"User ("+owneruuid+" does not exists.");
	});
};

database.prototype.AddDevice	=	function(machineuuid, name, type, cb)	{
	var _this = this;
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var device = new _this.Devices({
				machineuuid			: machineuuid,
				name				: name,
				type				: type 
			});
			device.save(function(err)	{
				if(err)	if(cb !== undefined) cb(null, "Save error", err);
				if(cb !== undefined) cb(device);
			});	
		}else
			if(cb !== undefined) cb(null,"Machine ("+machineuuid+" does not exists.");
	});
};

database.prototype.AddEthernet	=	function(machineuuid, iface, address, broadcast, netmask, rxbytes, txbytes, cb)	{
	var _this = this;
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var ethernet = new _this.Ethernets({
				machineuuid			: machineuuid,
				iface				: iface,
				address				: address,
				broadcast			: broadcast,
				netmask				: netmask,
				txbytes				: txbytes,
				rxbytes				: rxbytes  
			});
			ethernet.save(function(err)	{
				if(err)	if(cb !== undefined) cb(null, "Save error", err);
				if(cb !== undefined) cb(ethernet);
			});	
		}else
			if(cb !== undefined) cb(null,"Machine ("+machineuuid+" does not exists.");
	});
};

database.prototype.AddDisk	=	function(machineuuid, family, capacity, ontime, powercycles, readerrors, realocatedsectors, diskstatus, device, cb)	{
	var _this = this;
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var disk = new _this.Disks({
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
				if(err)	if(cb !== undefined) cb(null, "Save error", err);
				if(cb !== undefined) cb(disk);
			});	
		}else
			if(cb !== undefined) cb(null,"Machine ("+machineuuid+" does not exists.");
	});
};

database.prototype.AddMount	=	function(machineuuid, mountpoint, device, used, free, size, cb)	{
	var _this = this;
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var mount = new _this.Mounts({
				machineuuid			: machineuuid,
				mountpoint			: mountpoint,
				device 				: device,
				used				: used,
				free 				: free,
				size 				: size
			});
			mount.save(function(err)	{
				if(err)	if(cb !== undefined) cb(null, "Save error", err);
				if(cb !== undefined) cb(mount);
			});	
		}else
			if(cb !== undefined) cb(null,"Machine ("+machineuuid+" does not exists.");
	});
};

database.prototype.AddDRBD	=	function(machineuuid, version, connections, cb)	{
	var _this = this;
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var drbd = new _this.DRBD({
				machineuuid			: machineuuid,
				version				: version,
				connections			: connections 
			});
			drbd.GenUUID();
			drbd.save(function(err)	{
				if(err)	if(cb !== undefined) cb(null, "Save error", err);
				if(cb !== undefined) cb(drbd);
			});	
		}else
			if(cb !== undefined) cb(null,"Machine ("+machineuuid+" does not exists.");
	});
};

database.prototype.AddDRBDCONN	=	function(drbduuid, connid, cs, ro, ds, ns, cb)	{
	var _this = this;
	this.CheckDRBDUUID(drbduuid, function(ok)	{
		if(ok)	{
			var drbd = new _this.DRBDCONN({
				drbduuid			: drbduuid,
				connid				: connid,
				cs 					: cs,
				ro 					: ro,
				ds 					: ds,
				ns 					: ns
			});
			drbd.save(function(err)	{
				if(err)	if(cb !== undefined) cb(null, "Save error", err);
				if(cb !== undefined) cb(drbd);
			});	
		}else
			if(cb !== undefined) cb(null,"Machine ("+machineuuid+" does not exists.");
	});
};

database.prototype.AddMYSQL	=	function(machineuuid, masterhost, masteruser, slavestate, salveiorunning, slavesqlrunning, cb)	{
	var _this = this;
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var mysql = new _this.MYSQL({
				machineuuid			: machineuuid,
				masterhost			: masterhost,
				masteruser			: masteruser,
				slavestate			: slavestate,
				slaveiorunning		: slaveiorunning,
				slavesqlrunning		: slavesqlrunning  
			});
			mysql.save(function(err)	{
				if(err)	if(cb !== undefined) cb(null, "Save error", err);
				if(cb !== undefined) cb(mysql);
			});	
		}else
			if(cb !== undefined) cb(null,"Machine ("+machineuuid+" does not exists.");
	});
};


/*	TODO: AddVMS	*/	

database.prototype.UpdateMachine	=	function(uuid, data, cb)	{
	var dbthis = this;
	if(uuid == null)	{
		dbthis.AddMachine(data.owneruuid, data.name, data.processor, data.total_memory, data.free_memory, data.total_swap, data.free_swap, 1, data.uptime, function(machine, error, err)	{
			if(err)	{
				console.log("Error: ",err);
			}
			data.uuid = machine.uuid;
			dbthis._AddMachineData(machine.uuid, data, cb);
		});		
	}else{
		this.Machines.find({"uuid":uuid}, function(err, machines)	{
			if(machines != null && machines.length > 0 )	{
				var m 			= 	machines[0];
				m.name 			= 	data.name;
				m.processor 	= 	data.processor;
				m.total_memory	=	data.total_memory;
				m.free_memory	=	data.free_memory;
				m.total_swap	=	data.total_swap;
				m.free_swap		=	data.free_swap;
				m.current_status=	1;
				m.uptime		=	data.uptime;
				m.lastupdate	=	Date.now();
				m.os			=	data.os === undefined ? "Unknown" : data.os;
				m.save(function()	{
					m.CleanMachineData(function()	{
						dbthis._AddMachineData(uuid, data, cb);
					});
				});
			}else{
				dbthis.AddMachine(data.owneruuid, data.name, data.processor, data.total_memory, data.free_memory, data.total_swap, data.free_swap, 1, data.uptime, function(machine)	{
					data.uuid = machine.uuid;
					dbthis._AddMachineData(machine.uuid, data, cb);
				});
			}
		});
	}
};
database.prototype._AddMachineData	=	function(uuid, data, cb)	{
	var dbthis = this;
	//	Add Devices
	if(data.hasOwnProperty("devices"))
		for(var i in data.devices)	
			if(data.devices.hasOwnProperty(i))
				this.AddDevice(uuid, data.devices[i].name, data.devices[i].type);
	//	Add Ethernets
	if(data.hasOwnProperty("ethernets"))
		for(var i in data.ethernets)	
			if(data.ethernets.hasOwnProperty(i))
				this.AddEthernet(uuid,  data.ethernets[i].iface,  data.ethernets[i].address,  data.ethernets[i].broadcast,  data.ethernets[i].netmask,  data.ethernets[i].rxbytes,  data.ethernets[i].txbytes);
	//	Add Disks
	if(data.hasOwnProperty("disks"))
		for(var i in data.disks)	
			if(data.disks.hasOwnProperty(i))
				this.AddDisk(uuid, data.disks[i].family, data.disks[i].capacity, data.disks[i].ontime, data.disks[i].powercycles, data.disks[i].readerrors, data.disks[i].realocatedsectors, data.disks[i].diskstatus, data.disks[i].device);
	//	Add Mounts
	if(data.hasOwnProperty("mounts"))
		for(var i in data.mounts)	
			if(data.mounts.hasOwnProperty(i))
				this.AddMount(uuid, data.mounts[i].mountpoint, data.mounts[i].device, data.mounts[i].used, data.mounts[i].free, data.mounts[i].size);
	//	Add DRBDs
	if(data.hasOwnProperty("drbds"))
		for(var i in data.drbds)	
			if(data.drbds.hasOwnProperty(i))
				this.AddDRBD(uuid, data.drbds[i].version, data.drbds[i].connections, function(drbd, msg, err)	{
					if(drbd != null)	{
						if(data.drbds[i].hasOwnProperty("connections"))
							for(var z in data.drbds[i].connections)
								if(data.drbds[i].connections.hasOwnProperty(z))
									dbthis.AddDRBDCONN(drbd.uuid, data.drbds[i].connections[z].cs, data.drbds[i].connections[z].ro, data.drbds[i].connections[z].ds, data.drbds[i].connections[z].ns);
						
					}
				});
	//	Add MySQLs
	if(data.hasOwnProperty("mysqls"))
		for(var i in data.mysqls)	
			this.AddMYSQL(uuid, data.mysqls[i].masterhost, data.mysqls[i].masteruser, data.mysqls[i].slavestate, data.mysqls[i].slaveiorunning, data.mysqls[i].slavesqlrunning);
	
	//	Add VMS
	/*	TODO	*/

	if(cb !== undefined) cb(uuid, data);
}
exports.Database = database;