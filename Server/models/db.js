var machine 		= require("./machine.js");
var user 			= require("./user.js");
var info			= require("./info.js");

var database = function(url, config)	{
	if(url == undefined)	
		url = "mongodb://localhost/test";

	console.log("Initializing database");
	this.config 	=	config;

	this._mg 		= 	require('mongoose');
	this._mg.connect(url);

	this.mscheme 	=	machine.Schemas(this._mg);
	this.usrchema 	=	user.Schemas(this._mg);
	this.infoschema	=	info.Schemas(this._mg);

	this.Users 		= 	this._mg.model("Users", 		this.usrchema.userSchema);
	this.Machines 	= 	this._mg.model("Machines", 		this.mscheme.machineSchema); 
	this.Sessions	=	this._mg.model("Sessions",		this.usrchema.sessionSchema);
	this.Alerts		=	this._mg.model("Alerts",    	this.infoschema.alertSchema);

	this.Warnings	=	this._mg.model("Warnings",		this.infoschema.TWPSchema);
	this.Tasks		=	this._mg.model("Tasks",			this.infoschema.TWPSchema);
	this.Problems	=	this._mg.model("Problems",		this.infoschema.TWPSchema);

	this.Devices	=	this._mg.model("Devices", 		this.mscheme.deviceSchema); 
	this.Ethernets	=	this._mg.model("Ethernets", 	this.mscheme.ethernetSchema); 
	this.Disks		=	this._mg.model("Disks", 		this.mscheme.diskSchema); 
	this.Mounts		=	this._mg.model("Mounts", 		this.mscheme.mountSchema); 
	this.DRBD 		=	this._mg.model("DRBD", 			this.mscheme.drbdSchema); 
	this.DRBDCONN	=	this._mg.model("DRBDCONN", 		this.mscheme.drbdconnSchema); 
	this.MYSQL		=	this._mg.model("MYSQL", 		this.mscheme.mysqlSchema); 
	this.VMS		=	this._mg.model("VMS", 			this.mscheme.vmSchema); 
	this.FolderGroup=	this._mg.model("FolderGroup", 	this.mscheme.folderGroupSchema); 
	this.MailDomain	=	this._mg.model("MailDomain", 	this.mscheme.mailDomainSchema); 
	//return this;
};

database.prototype.CheckSessions	=	function(cb)	{
	this.Sessions.find({}, function(err, data)	{
		for(var i in data)	{
			if(data.hasOwnProperty(i))	{
				if(!data[i].IsValid())
					data[i].remove();
			}
		}
		if(cb !== undefined)
			cb();
	});
};

database.prototype.GetUnsolvedTasks	=	function(uuid, cb)	{
	return this.Tasks.find({}).where('solved', false).or([{"to":uuid},{"to":"ALL"},{"cc":uuid}]).sort({target: -1}).limit(this.config.internals.max_twp_results).exec(cb);
}

database.prototype.GetUnsolvedProblems	=	function(uuid, cb)	{
	return this.Problems.find({}).where('solved', false).or([{"to":uuid},{"to":"ALL"},{"cc":uuid}]).sort({target: -1}).limit(this.config.internals.max_twp_results).exec(cb);
}

database.prototype.GetUnsolvedWarnings	=	function(uuid, cb)	{
	return this.Warnings.find({}).where('solved', false).or([{"to":uuid},{"to":"ALL"},{"cc":uuid}]).sort({target: -1}).limit(this.config.internals.max_twp_results).exec(cb);
}

database.prototype.GetAlerts		=	function(uuid, cb)	{
	return this.Alerts.find({}).or([{"to":uuid},{"to":"ALL"},{"cc":uuid}]).sort({when: -1}).exec(cb);
}

database.prototype.GetMachines	=	function(cb)	{
	return this.Machines.find({}).sort({name: 1}).exec(cb);
};

database.prototype.GetUserMachines	=	function(uuid, cb)	{
	var db = this;
	return this.Users.findOne({"uuid":uuid}, function(err, data) {
		var mf = db.Machines.find({});
		var orquery = [{"owneruuid":uuid}];
		if(data.extras !== undefined)	{
			for(var i=0;i<data.extras.length;i++)	
				orquery.push({"owneruuid":data.extras[i]});
		}
		mf.or(orquery);
		mf.exec(cb);
	}); 
};

database.prototype.GetMachine 		=	function(uuid, cb)	{
	return this.Machines.findOne({"uuid":uuid}, cb);
};

database.prototype.CheckUserUUID	=	function(uuid, cb)	{
	this.Users.find({"uuid":uuid}, function(err, data)	{
		if(cb !== undefined) cb(data != null && data.length > 0, data[0]);
	});
};	

database.prototype.CheckUsername	=	function(username, cb)	{
	this.Users.find({"username":username}, function(err, data)	{
		if(cb !== undefined) cb(data != null && data.length > 0);
	});	
};

database.prototype.ChangePassword	=	function(uuid, password, cb)	{
	this.Users.findOne({"uuid":uuid}, function(err, data)	{
		if(err)	{
			if(cb !== undefined) 
				cb(false, err);
		}else{
			data.SetPassword(password);
			data.save(function(err)	{
				if(err)	
					console.log("Error saving user password ("+uuid+"): ",err);
				if(cb !== undefined)
					cb(!err,err);
			});
		}
	});
}

database.prototype.ChangeName	=	function(uuid, name, cb)	{
	this.Users.findOne({"uuid":uuid}, function(err, data)	{
		if(err)	{
			if(cb !== undefined) 
				cb(false, err);
		}else{
			data.name = name;
			data.save(function(err)	{
				if(err)	
					console.log("Error saving user name ("+uuid+"): ",err);
				if(cb !== undefined)
					cb(!err,err);
			});
		}
	});	
}

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
	var _this = this;
	this.CheckUsername(username, function(exists)	{
		if(exists)	{	
			if(cb !== undefined) 
				cb(null, "Already exists");
		}else{
			var user = new _this.Users({"username":username,"name":name, "level":level});
			user.GenUUID();
			user.SetPassword(password);
			user.save(function(err)	{
				if(err && cb !== undefined)	 cb(null,"Save error", err);
				if(cb !== undefined) cb(user);
			});
		}
	});
};

database.prototype.TestLogin		=	function(username, password, cb)	{
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

database.prototype.CheckSession 	=	function(sessionkey, cb)	{
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

database.prototype.MarkSolvedTask	=	function(twpuuid, useruuid, cb)	{
	this.Tasks.findOne({"uuid":twpuuid}, function(err, data)	{
		if(err)	{
			console.log("Error: "+err);
			if(cb != null)
				cb(false);	
		}else{
			if(data.to == useruuid || useruuid == undefined || useruuid == null|| data.cc.indexOf(useruuid) > -1)	{
				data.solved = true;
				data.solvedby = useruuid;
				data.save(function(err)	{
					if(err) {
						console.log("Error Saving: "+err);
						cb(false);
					}else{
						if(cb != null)	
							cb(true);
						
					}
				});
			}else
				if(cb != null)
					cb(false);
		}
	});
}

database.prototype.MarkSolvedWarning	=	function(twpuuid, useruuid, cb)	{
	this.Warnings.findOne({"uuid":twpuuid}, function(err, data)	{
		if(err)	{
			console.log("Error: "+err);
			if(cb != null)
				cb(false);	
		}else{
			if(data.to == useruuid || useruuid == undefined || useruuid == null|| data.cc.indexOf(useruuid) > -1)	{
				data.solved = true;
				data.solvedby = useruuid;
				data.save(function(err)	{
					if(err) {
						console.log("Error Saving: "+err);
						cb(false);
					}else{
						if(cb != null)	
							cb(true);
						
					}
				});
			}else
				if(cb != null)
					cb(false);
		}
	});
}

database.prototype.MarkSolvedProblem	=	function(twpuuid, useruuid, cb)	{
	this.Problems.findOne({"uuid":twpuuid}, function(err, data)	{
		if(err)	{
			console.log("Error: "+err);
			if(cb != null)
				cb(false);	
		}else{
			if(data.to == useruuid || useruuid == undefined || useruuid == null || data.cc.indexOf(useruuid) > -1)	{
				data.solved = true;
				data.solvedby = useruuid;
				data.save(function(err)	{
					if(err) {
						console.log("Error Saving: "+err);
						cb(false);
					}else{
						if(cb != null)	
							cb(true);
						
					}
				});
			}else
				if(cb != null)
					cb(false);
		}
	});
}

database.prototype.CreateSession	=	function(useruuid, level, maxdays, cb)	{
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

database.prototype.AddMachine	=	function(owneruuid, name, processor, total_memory, free_memory, total_swap, free_swap, current_status, uptime, os, cb)	{
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
			  os				:   os,
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
			if (ontime.indexOf("h+") > -1) {
				ontime = ontime.split("+");
				var realontime = 0;
				for(var i in ontime) {
					var ontime_n = parseFloat(ontime[i]);
					if (ontime[i].indexOf("h") > -1)
						realontime += ontime_n;
					if (ontime[i].indexOf("m") > -1)
						realontime += ontime_n / 60;
					if (ontime[i].indexOf("s") > -1)
						realontime += ontime_n / 3600;
				}
				ontime = Math.round(realontime*100) / 100.0;
			}
			if (readerrors.indexOf("/") > -1)
				readerrors = readerrors.split("/")[0]

			if (realocatedsectors == "")
				realocatedsectors = 0;

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

database.prototype.AddVM	=	function(machineuuid, name, guestos, memory, cpus, type, status, cb)	{
	var _this = this;
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var vm = new _this.VMS({
				machineuuid			: machineuuid,
				name				: name,
				guestos				: guestos,
				memory 				: memory,
				cpus				: cpus,
				type				: type,
				status 				: status
			});
			vm.save(function(err)	{
				if(err)	if(cb !== undefined) cb(null, "Save error", err);
				if(cb !== undefined) cb(vm);
			});	
		}else
			if(cb !== undefined) cb(null,"Machine ("+machineuuid+" does not exists.");
	});
};

database.prototype.AddFolderGroup	=	function(machineuuid, name, description, folders, cb)	{
	var _this = this;
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var fg = new _this.FolderGroup({
				machineuuid			: machineuuid,
				name				: name,
				description			: description,
				folders 			: []
			});
			for(var i in folders)	{
				var folder = {
					name				: folders[i].name,
					size 				: folders[i].size    || 0,
					files 				: folders[i].files   || 0,
					folders 			: folders[i].folders || 0,
					free 				: folders[i].free    || 0			
				};
				fg.folders.push(folder);
			}
			fg.save(function(err)	{
				if(err)	if(cb !== undefined) cb(null, "Save error", err);
				if(cb !== undefined) cb(fg);
			});	
		}else
			if(cb !== undefined) cb(null,"Machine ("+machineuuid+" does not exists.");
	});
};

database.prototype.AddMailDomain	=	function(machineuuid, maildomain, name, mailboxes, cb)	{
	var _this = this;
	this.CheckMachineUUID(machineuuid, function(ok)	{
		if(ok)	{
			var md = new _this.MailDomain({
				machineuuid			: machineuuid,
				maildomain 			: maildomain,
				name   				: name,
				mailboxes 			: mailboxes
			});
			md.save(function(err)	{
				if(err)	if(cb !== undefined) cb(null, "Save error", err);
				if(cb !== undefined) cb(md);
			});	
		}else
			if(cb !== undefined) cb(null,"Machine ("+machineuuid+" does not exists.");
	});
};



database.prototype.UpdateMachine	=	function(uuid, data, cb)	{
	var dbthis = this;
	if(uuid == null)	{
		dbthis.AddMachine(data.owneruuid, data.name, data.processor, data.total_memory, data.free_memory, data.total_swap, data.free_swap, 1, data.uptime, data.os, function(machine, error, err)	{
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
				dbthis.AddMachine(data.owneruuid, data.name, data.processor, data.total_memory, data.free_memory, data.total_swap, data.free_swap, 1, data.uptime, data.os, function(machine)	{
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
			this.AddDevice(uuid, data.devices[i].name, data.devices[i].type);
	//	Add Ethernets
	if(data.hasOwnProperty("ethernets"))
		for(var i in data.ethernets)	
			this.AddEthernet(uuid,  data.ethernets[i].iface,  data.ethernets[i].address,  data.ethernets[i].broadcast,  data.ethernets[i].netmask,  data.ethernets[i].rxbytes,  data.ethernets[i].txbytes);
	//	Add Disks
	if(data.hasOwnProperty("disks"))
		for(var i in data.disks)	
			this.AddDisk(uuid, data.disks[i].family, data.disks[i].capacity, data.disks[i].ontime, data.disks[i].powercycles, data.disks[i].readerrors, data.disks[i].realocatedsectors, data.disks[i].diskstatus, data.disks[i].device);
	//	Add Mounts
	if(data.hasOwnProperty("mounts"))
		for(var i in data.mounts)	
			this.AddMount(uuid, data.mounts[i].mountpoint, data.mounts[i].device, data.mounts[i].used, data.mounts[i].free, data.mounts[i].size);

	//	Add DRBDs
	if(data.hasOwnProperty("drbds"))
			this.AddDRBD(uuid, data.drbds.version, data.drbds.conn.length, function(drbd, msg, err)	{
				if(drbd != null)	{
					for(var z in data.drbds.conn)
						dbthis.AddDRBDCONN(drbd.uuid, z, data.drbds.conn[z].cs, data.drbds.conn[z].ro, data.drbds.conn[z].ds, data.drbds.conn[z].ns);
					
				}
			});
	//	Add MySQLs
	if(data.hasOwnProperty("mysqls"))
		for(var i in data.mysqls)	
			this.AddMYSQL(uuid, data.mysqls[i].masterhost, data.mysqls[i].masteruser, data.mysqls[i].slavestate, data.mysqls[i].slaveiorunning, data.mysqls[i].slavesqlrunning);
	
	//	Add VMS
	if(data.hasOwnProperty("vms"))
		for(var i in data.vms)
			this.AddVM(uuid, data.vms[i].name, data.vms[i].guestos, data.vms[i].memory, data.vms[i].cpus, data.vms[i].type, data.vms[i].status);

	//	Add Folders Group
	if(data.hasOwnProperty("foldersgroup"))
		for(var i in data.foldersgroup)
			this.AddFolderGroup(uuid, data.foldersgroup[i].name, data.foldersgroup[i].description, data.foldersgroup[i].folders);

	//	Add Mail Domain
	if(data.hasOwnProperty("maildomains"))
		for(var i in data.maildomains)
			this.AddMailDomain(uuid, data.maildomains[i].domain, data.maildomains[i].name, data.maildomains[i].mailboxes);

	if(cb !== undefined) cb(uuid, data);
}
exports.Database = database;