

var apimanager = function(database, app, config, control)	{
	console.log("Initializing API Manager");

	this.db 	= database;
	this.app 	= app;
	this.config	= config;
	this.control = control;
	var _this 	= this;

	app.get("/api/"						,	function(r, q) { _this.apibase(r,q); 			});
	app.post("/api/"					,	function(r, q) { _this.apibase(r,q); 			});
	app.post("/api/login"				, 	function(r, q) { _this.login(r,q); 				});
	app.post("/api/logout"				, 	function(r, q) { _this.logout(r,q); 			});
	app.post("/api/getconfig"			,	function(r, q) { _this.getconfig(r,q);     	 	});
	app.post("/api/checksession"		,	function(r, q) { _this.checksession(r, q);      });

	app.post("/api/updatemachine"		, 	function(r, q) { _this.updatemachine(r,q);		});

	app.post("/api/updatedevices"		,	function(r, q) { _this.updatedevices(r,q);  	});
	app.post("/api/updateethernets"		,	function(r, q) { _this.updateethernets(r,q);	});
	app.post("/api/updatedisks"			,	function(r, q) { _this.updatedisks(r,q);  		});
	app.post("/api/updatemounts"		,	function(r, q) { _this.updatemounts(r,q);  		});
	app.post("/api/updatemysqls"		,	function(r, q) { _this.updatemysqls(r,q);  		});
	app.post("/api/updatedrbds"			,	function(r, q) { _this.updatedrbds(r,q);  		});
	app.post("/api/updatevms"			,	function(r, q) { _this.updatevms(r,q);  		});
	app.post("/api/updatefoldergroups"	,	function(r, q) { _this.updatefoldergroups(r,q);	});
	app.post("/api/updatemaildomains"	,	function(r, q) { _this.updatemaildomains(r,q);	});
	app.post("/api/updatestate"			,	function(r, q) { _this.updatestate(r,q); 		});

	app.post("/api/addmachineextra"		,	function(r, q) { _this.addmachineextra(r,q);  	});
	app.post("/api/delmachineextra"		,	function(r, q) { _this.delmachineextra(r,q);  	});
	app.post("/api/editmachineextra"	,	function(r, q) { _this.editmachineextra(r,q);  	});

	app.post("/api/marksolvedtask"		,	function(r, q) { _this.marksolvedtask(r,q); 	});
	app.post("/api/marksolvedwarning"	,	function(r, q) { _this.marksolvedwarning(r,q); 	});
	app.post("/api/marksolvedproblem"	,	function(r, q) { _this.marksolvedproblem(r,q); 	});

	app.post("/api/adduser"				,	function(r, q) { _this.adduser(r,q); 			});
	app.post("/api/changename"			,	function(r, q) { _this.changename(r,q);			});
	app.post("/api/changepassword"		,	function(r, q) { _this.changepassword(r,q);		});
	app.post("/api/getusername"			,	function(r, q) { _this.getusername(r,q);    	});

	app.post("/api/loadalerts"			,	function(r, q) { _this.loadalerts(r,q);			});
	app.post("/api/loadtasks"			,	function(r, q) { _this.loadtasks(r,q);			});
	app.post("/api/loadwarnings"		,	function(r, q) { _this.loadwarnings(r,q);		});
	app.post("/api/loadproblems"		,	function(r, q) { _this.loadproblems(r,q);		});
	app.post("/api/loadmachines"		,	function(r, q) { _this.loadmachines(r,q);		});

	app.post("/api/loadmachine"			,	function(r, q) { _this.loadmachine(r,q);		});
	app.post("/api/loadmdevices"		,	function(r, q) { _this.loadmdevices(r,q);		});
	app.post("/api/loadmethernets"		,	function(r, q) { _this.loadmethernets(r,q);		});
	app.post("/api/loadmdisks"			,	function(r, q) { _this.loadmdisks(r,q);			});
	app.post("/api/loadmmounts"			,	function(r, q) { _this.loadmmounts(r,q);		});
	app.post("/api/loadmdrbds"			,	function(r, q) { _this.loadmdrbds(r,q);			});
	app.post("/api/loadmmysqls"			,	function(r, q) { _this.loadmmysqls(r,q);		});
	app.post("/api/loadmvms"			,	function(r, q) { _this.loadmvms(r,q);			});
	app.post("/api/loadmfoldergroups"	,	function(r, q) { _this.loadmfoldergroups(r,q);	});
	app.post("/api/loadmmaildomains"	,	function(r, q) { _this.loadmmaildomains(r,q);	});

	control.SlackAsMaster("API Ready");
};

apimanager.prototype.apibase		=	function(req, res)	{
	res.json({"status":"NOK","code":"NO_COMMAND","error":"No Command"});
};

apimanager.prototype.checksession 	=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, sdata)	{
		res.json({"status":"OK","session":ok});
	});

}
apimanager.prototype.marksolvedtask	=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, sdata)	{
		if(ok)	{
			sdata.GetUser(function(err, udata)	{
				if(err)	{
					console.log("Error getting session user: "+err);
					res.json({"status":"NOK","code":"INTERNAL_ERROR"});
				}else{
					if(udata[0].level > 1)	{
						db.MarkSolvedTask(req.body.twpuuid, null, function(ok)	{
							if(ok)
								res.json({"status":"OK"});
							else
								res.json({"status":"NOK","code":"NOT_TO_YOU"})
						});
					}else{
						db.MarkSolvedTask(req.body.twpuuid, udata[0].uuid, function(ok)	{
							if(ok)
								res.json({"status":"OK"});
							else
								res.json({"status":"NOK","code":"NOT_TO_YOU"})
						});						
					}
				}
			});
		}else{
			res.json({"status":"NOK","code":"INVALID_SESSION"});
		}
	});
}

apimanager.prototype.marksolvedwarning	=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, sdata)	{
		if(ok)	{
			sdata.GetUser(function(err, udata)	{
				if(err)	{
					console.log("Error getting session user: "+err);
					res.json({"status":"NOK","code":"INTERNAL_ERROR"});
				}else{
					if(udata[0].level > 1)	{
						db.MarkSolvedWarning(req.body.twpuuid, null, function(ok)	{
							if(ok)
								res.json({"status":"OK"});
							else
								res.json({"status":"NOK","code":"NOT_TO_YOU"})
						});
					}else{
						db.MarkSolvedWarning(req.body.twpuuid, udata[0].uuid, function(ok)	{
							if(ok)
								res.json({"status":"OK"});
							else
								res.json({"status":"NOK","code":"NOT_TO_YOU"})
						});						
					}
				}
			});
		}else{
			res.json({"status":"NOK","code":"INVALID_SESSION"});
		}
	});
}

apimanager.prototype.marksolvedproblem	=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, sdata)	{
		if(ok)	{
			sdata.GetUser(function(err, udata)	{
				if(err)	{
					console.log("Error getting session user: "+err);
					res.json({"status":"NOK","code":"INTERNAL_ERROR"});
				}else{
					if(udata[0].level > 1)	{
						db.MarkSolvedProblem(req.body.twpuuid, udata[0].uuid, function(ok)	{
							if(ok)
								res.json({"status":"OK"});
							else
								res.json({"status":"NOK","code":"NOT_TO_YOU"})
						});
					}else{
						db.MarkSolvedProblem(req.body.twpuuid, udata[0].uuid, function(ok)	{
							if(ok)
								res.json({"status":"OK"});
							else
								res.json({"status":"NOK","code":"NOT_TO_YOU"})
						});						
					}
				}
			});
		}else{
			res.json({"status":"NOK","code":"INVALID_SESSION"});
		}
	});
}

apimanager.prototype.getconfig		=	function(req, res)	{
	var uconfig = {
		"company_title"		: this.config.company_title,
		"page_logo"			: this.config.page_logo,
		"WebUI_Parameters"	: this.config.WebUI_Parameters,
		"internals"			:  {
			"max_twp_results"	: this.config.internals.max_twp_results, 
			"timings" 		: {
				"refreshdata"	: this.config.internals.timings.RefreshData
			}
		},
	};
	res.json({"status":"OK","data":uconfig});
}

apimanager.prototype.changename		=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, sdata)	{
		if(ok)	{
			sdata.GetUser(function(err, udata)	{
				if(err)
					res.json({"status":"NOK","code":"INTERNAL_ERROR"});
				else{
					if(udata[0].level > 1)	{
						db.ChangeName(req.body.uuid, req.body.name, function(ok, err)	{
							if(ok)
								res.json({"status":"OK"});
							else
								res.json({"status":"NOK","code":"INTERNAL_ERROR"});
						});
					}else{
						if(req.body.uuid = sdata.useruuid)	{
							db.ChangeName(req.body.uuid, req.body.name, function(ok, err)	{
								if(ok)
									res.json({"status":"OK"});
								else
									res.json({"status":"NOK","code":"INTERNAL_ERROR"});
							});						
						}else
							res.json({"status":"NOK","code":"NOT_AUTHORIZED"});
					}
				}
			});
		}else{
			res.json({"status":"NOK","code":"INVALID_SESSION"});
		}
	});
}

apimanager.prototype.changepassword	=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, sdata)	{
		if(ok)	{
			sdata.GetUser(function(err, udata)	{
				if(err)
					res.json({"status":"NOK","code":"INTERNAL_ERROR"});
				else{
					if(udata[0].level > 1)	{
						db.ChangePassword(req.body.uuid, req.body.password, function(ok, err)	{
							if(ok)
								res.json({"status":"OK"});
							else
								res.json({"status":"NOK","code":"INTERNAL_ERROR"});
						});
					}else{
						if(req.body.uuid = sdata.useruuid)	{
							db.ChangePassword(req.body.uuid, req.body.password, function(ok, err)	{
								if(ok)
									res.json({"status":"OK"});
								else
									res.json({"status":"NOK","code":"INTERNAL_ERROR"});
							});						
						}else
							res.json({"status":"NOK","code":"NOT_AUTHORIZED"});
					}
				}
			});
		}else{
			res.json({"status":"NOK","code":"INVALID_SESSION"});
		}
	});
}

apimanager.prototype.getusername	=	function(req, res)	{
	this.db.CheckUserUUID(req.body.uuid, function(ok, data)	{
		if(ok)	
			res.json({"status":"OK","name":data.name})
		else
			res.json({"status":"OK","name":"Desconhecido"});
	});
}

apimanager.prototype.addmachineextra	=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			if(req.body.hasOwnProperty("name") && req.body.hasOwnProperty("value"))	{
				data.AddExtra(req.body.name, req.body.value, function(ok, err)	{
					if(!err)
						res.json({"status":"OK"});
					else
						res.json({"status":"NOK","code":err});
				});
			}else{
				res.json({"status":"NOK","code":"MISSING_FIELDS"});
			}
		}
	});
};

apimanager.prototype.delmachineextra	=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			if(req.body.hasOwnProperty("name"))	{
				data.DelExtra(req.body.name, function(ok, err)	{
					if(!err)
						res.json({"status":"OK"});
					else
						res.json({"status":"NOK","code":err});
				});
			}else{
				res.json({"status":"NOK","code":"MISSING_FIELDS"});
			}
		}
	});
};

apimanager.prototype.editmachineextra	=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			if(req.body.hasOwnProperty("name") && req.body.hasOwnProperty("value"))	{
				data.UpdateExtra(req.body.name, req.body.value, function(ok, err)	{
					if(!err)
						res.json({"status":"OK"});
					else
						res.json({"status":"NOK","code":err});
				});
			}else{
				res.json({"status":"NOK","code":"MISSING_FIELDS"});
			}
		}
	});
};

apimanager.prototype.updatedevices	=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			if(req.body.hasOwnProperty("devices"))
				data.CleanDevices(function()	{
					for(var i in req.body.devices)	
						db.AddDevice(req.body.machineuuid, req.body.devices[i].name, req.body.devices[i].type);
					res.json({"status":"OK"});
				});
		}
	});
};

apimanager.prototype.updateethernets	=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			if(req.body.hasOwnProperty("ethernets"))	{
				data.CleanEthernets(function()	{
					for(var i in req.body.ethernets)	
						db.AddEthernet(req.body.machineuuid,  req.body.ethernets[i].iface,  req.body.ethernets[i].address,  req.body.ethernets[i].broadcast,  req.body.ethernets[i].netmask,  req.body.ethernets[i].rxbytes,  req.body.ethernets[i].txbytes);
					res.json({"status":"OK"});
				});
			}
		}
	});
};

apimanager.prototype.updatedisks	=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			if(req.body.hasOwnProperty("disks"))	{
				data.CleanDisks(function()	{
					for(var i in req.body.disks)	
						db.AddDisk(req.body.machineuuid, req.body.disks[i].family, req.body.disks[i].capacity, req.body.disks[i].ontime, req.body.disks[i].powercycles, req.body.disks[i].readerrors, req.body.disks[i].realocatedsectors, req.body.disks[i].diskstatus, req.body.disks[i].device);
					res.json({"status":"OK"});
				});
			}
		}
	});
};

apimanager.prototype.updatemounts	=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			if(req.body.hasOwnProperty("mounts"))	{
				data.CleanMounts(function()	{
					for(var i in req.body.mounts)	
						db.AddMount(req.body.machineuuid, req.body.mounts[i].mountpoint, req.body.mounts[i].device, req.body.mounts[i].used, req.body.mounts[i].free, req.body.mounts[i].size);
					res.json({"status":"OK"});
				});
			}
		}
	});
};

apimanager.prototype.updatemysqls	=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			if(req.body.hasOwnProperty("mysqls"))	{
				data.CleanMYSQLs(function()	{
					for(var i in req.body.mysqls)	
						db.AddMYSQL(req.body.machineuuid, req.body.mysqls[i].masterhost, req.body.mysqls[i].masteruser, req.body.mysqls[i].slavestate, req.body.mysqls[i].slaveiorunning, req.body.mysqls[i].slavesqlrunning);
					res.json({"status":"OK"});
				});
			}
		}
	});
};

apimanager.prototype.updatedrbds	=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			if(req.body.hasOwnProperty("drbds"))	{
				data.CleanDRBDs(function()	{
					for(var i in req.body.drbds)	{
						db.AddDRBD(uuid, req.body.drbds[i].version, req.body.drbds[i].connections, function(drbd, msg, err)	{
							if(drbd != null)	{
								if(req.body.drbds[i].hasOwnProperty("connections"))
									for(var z in req.body.drbds[i].connections)
										db.AddDRBDCONN(drbd.uuid, req.body.drbds[i].connections[z].cs, req.body.drbds[i].connections[z].ro, req.body.drbds[i].connections[z].ds, req.body.drbds[i].connections[z].ns);
								
							}
							res.json({"status":"OK"});
						});
					}
				});
			}
		}
	});
};

apimanager.prototype.updatevms	=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			if(req.body.hasOwnProperty("vms"))	{
				data.CleanVMs(function()	{
					for(var i in req.body.vms)
						this.AddVM(uuid, req.body.vms[i].name, req.body.vms[i].guestos, req.body.vms[i].memory, req.body.vms[i].cpus, req.body.vms[i].type, req.body.vms[i].status);
					res.json({"status":"OK"});
				});
			}
		}
	});
};

apimanager.prototype.updatefoldergroups =	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			if(req.body.hasOwnProperty("foldergroups"))	{
				data.CleanFolderGroups(function()	{
					for(var i in req.body.foldergroups)
						this.AddFolderGroup(uuid, data.foldersgroup[i].name, data.foldersgroup[i].description, data.foldersgroup[i].folders);
					res.json({"status":"OK"});
				});
			}
		}
	});
};

apimanager.prototype.updatemaildomains =	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			if(req.body.hasOwnProperty("maildomains"))	{
				data.CleanMailDomains(function()	{
					for(var i in req.body.maildomains)
						this.AddMailDomain(uuid, data.maildomains[i].domain, data.maildomains[i].name, data.maildomains[i].mailboxes);
					res.json({"status":"OK"});
				});
			}
		}
	});
};


apimanager.prototype.updatestate	=	function(req, res)	{
	var db = this.db;
	var _this = this;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{			
			if(req.body.hasOwnProperty("mstatus"))	{
				data.current_status = req.body.mstatus;
				data.save();
				if(req.body.mstatus == 0)
					_this.control._SlackFunc("Estou sendo desligado!", data.name);
				else
					_this.control._SlackFunc("Estou de volta!", data.name);
				res.json({"status":"OK"});
			}else{
				res.json({"status":"NOK","code":"NO_STATUS","error":"No status to update!"});
			}
		}
	});
};

apimanager.prototype.loadmdevices		=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			data.GetDevices(function(err,mdata)	{
				if(err) res.json({"status":"OK","data":[]});
				else    res.json({"status":"OK","data":mdata});
			});
		}
	});
};

apimanager.prototype.loadmethernets		=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			data.GetEthernets(function(err,mdata)	{
				if(err) res.json({"status":"OK","data":[]});
				else    res.json({"status":"OK","data":mdata});
			});
		}
	});
};

apimanager.prototype.loadmdisks		=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			data.GetDisks(function(err,mdata)	{
				if(err) res.json({"status":"OK","data":[]});
				else    res.json({"status":"OK","data":mdata});
			});
		}
	});
};

apimanager.prototype.loadmmounts		=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			data.GetMounts(function(err,mdata)	{
				if(err) res.json({"status":"OK","data":[]});
				else    res.json({"status":"OK","data":mdata});
			});
		}
	});
};

apimanager.prototype.loadmdrbds		=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			data.GetDRBDs(function(err,mdata)	{
				if(err) res.json({"status":"OK","data":{"version":"0.00","conns":[]}});
				else{
					if(mdata.length >0)	{
						mdata[0].GetConnections(function(err, ddata)	{
							var output = JSON.parse(JSON.stringify(mdata[0]));
							if(err)	
								output.conns = [];
							else
								output.conns = ddata;
							res.json({"status":"OK","data":output});
						});
					}else{
						res.json({"status":"OK","data":{"version":"0.00","conns":[]}});
					}
				}
			});
		}
	});
};

apimanager.prototype.loadmmysqls		=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			data.GetMYSQLs(function(err,mdata)	{
				if(err) res.json({"status":"OK","data":[]});
				else    res.json({"status":"OK","data":mdata});
			});
		}
	});
};

apimanager.prototype.loadmvms		=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			data.GetVMs(function(err,mdata)	{
				if(err) res.json({"status":"OK","data":[]});
				else    res.json({"status":"OK","data":mdata});
			});
		}
	});
};

apimanager.prototype.loadmfoldergroups		=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			data.GetFolderGroups(function(err,mdata)	{
				if(err) res.json({"status":"OK","data":[]});
				else    res.json({"status":"OK","data":mdata});
			});
		}
	});
};

apimanager.prototype.loadmmaildomains		=	function(req, res)	{
	var db = this.db;
	this._loadmachine(req, res, function(err, data)	{
		if(!err)	{
			data.GetMailDomains(function(err,mdata)	{
				if(err) res.json({"status":"OK","data":[]});
				else    res.json({"status":"OK","data":mdata});
			});
		}
	});
};

apimanager.prototype._loadmachine		=	function(req, res, cb)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, sdata)	{
		if(ok)	{
			sdata.GetUser(function(err, udata)	{
				if(udata[0].level > 1)	{
					db.GetMachine(req.body.machineuuid,function(err, mdata)	{
						if(err)
							res.json({"status":"OK","data":{}});
						cb(err,mdata);
					});
				}else{
					db.GetMachine(req.body.machineuuid, function(err, mdata)	{
						if(err)	
							res.json({"status":"OK","data":{}});
						else if(mdata.owneruuid == sdata.useruuid)
							cb(err,mdata);
						else{
							res.json({"status":"NOK","code":"NOT_OWNER","data":{}});
							cb("NOT_OWNER",mdata);
						}
					});
				}
			});
		}else{
			res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});	
			cb("NOT_AUTHORIZED",null);
		}
	});		
};

apimanager.prototype.loadmachine 		=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, sdata)	{
		if(ok)	{
			sdata.GetUser(function(err, udata)	{
				if(udata[0].level > 1)	{
					db.GetMachine(req.body.machineuuid,function(err, mdata)	{
						if(err)
							res.json({"status":"OK","data":{}});
						else
							res.json({"status":"OK","data":mdata});
					});
				}else{
					db.GetMachine(req.body.machineuuid, function(err, mdata)	{
						if(err)
							res.json({"status":"OK","data":{}});
						else if(mdata.owneruuid == sdata.useruuid)
							res.json({"status":"OK","data":mdata});
						else
							res.json({"status":"NOK","code":"NOT_OWNER","data":{}});
					});
				}
			});
		}else
			res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});
	});		
}


apimanager.prototype.loadmachines		=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, sdata)	{
		if(ok)	{
			sdata.GetUser(function(err, udata)	{
				if(udata[0].level > 1)	{
					db.GetMachines(function(err, mdata)	{
						if(err)
							res.json({"status":"OK","data":[]});
						else
							res.json({"status":"OK","data":mdata});
					});
				}else{
					db.GetUserMachines(udata[0].uuid, function(err, mdata)	{
						if(err)
							res.json({"status":"OK","data":[]});
						else
							res.json({"status":"OK","data":mdata});
					});
				}
			});
		}else
			res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});
	});	
}

apimanager.prototype.loadalerts	=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, data)	{
		if(ok)	{
			db.GetAlerts(data.useruuid, function(err, adata)	{
				if(err)	res.json({"status":"OK","data":[]});
				else    res.json({"status":"OK","data":adata});
			});
		}else
			res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});
	});	
}


apimanager.prototype.loadtasks	=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, data)	{
		if(ok)	{
			db.GetUnsolvedTasks(data.useruuid, function(err, adata)	{
				if(err)	res.json({"status":"OK","data":[]});
				else    res.json({"status":"OK","data":adata});
			});
		}else
			res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});
	});	
}

apimanager.prototype.loadwarnings	=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, data)	{
		if(ok)	{
			db.GetUnsolvedWarnings(data.useruuid, function(err, adata)	{
				if(err)	res.json({"status":"OK","data":[]});
				else    res.json({"status":"OK","data":adata});
			});
		}else
			res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});
	});	
}

apimanager.prototype.loadproblems	=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, data)	{
		if(ok)	{
			db.GetUnsolvedProblems(data.useruuid, function(err, adata)	{
				if(err)	res.json({"status":"OK","data":[]});
				else    res.json({"status":"OK","data":adata});
			});
		}else
			res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});
	});	
}


apimanager.prototype.adduser		=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, data)	{
		if(ok)	{
			data.GetUser(function(err, data)	{
				if(data != null)	{
					if(data[0].level > 1)	{
						db.AddUser(req.body.add_username,req.body.add_password,req.body.add_name,req.body.add_level, function(data,msg,err)	{
							if(data != null)	
								res.json({"status":"OK","uuid":data.uuid});
							else
								res.json({"status":"NOK","code":"GENERIC_ERROR","error":msg});
						});
					}else
						res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});
				}else
					res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});
			});
		}else
			res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"Access denied"});
	});
};

apimanager.prototype.login			=	function(req, res)	{
	var db = this.db;
	db.TestLogin(req.body.username, req.body.password, function(ok, user)	{
		if(ok)	{
			db.CreateSession(user.uuid, req.body.level, req.body.maxdays, function(data, error)	{
				if(data != null)	{
					delete user.password;
					res.json({"status":"OK","sessionkey":data.sessionkey,"uuid":user.uuid,"userdata":user});
				}else{
					console.log("Session error: "+error);
					res.json({"error":error,"status":"NOK"});
				}
			});
		}else{
			res.json({"status":"NOK","code":"INVALID_USER","error":"Invalid username or password!"});
		}
	});
};

apimanager.prototype.checklogin		=	function(req, res)	{
	var db = this.db;
	if(req.body.hasOwnProperty("sessionkey"))	{
		db.CheckSession(req.body.sessionkey, function(ok, data)	{
			db.GetUser(data.useruuid, function(ok, udata)	{
				if(ok)	
					res.json({"status":"OK","data":udata});
				else{	//	Unlikely, but if so, there is a ghost session
					data.remove();
					res.json({"status":"NOK","code":"NOT_AUTHORIZED"});
				}
			});
		});
	}else
		res.json({"status":"NOK","code":"NOT_AUTHORIZED"});

}

apimanager.prototype.logout			=	function(req, res)	{
	var db = this.db;
	db.CheckSession(req.body.sessionkey, function(ok, data)	{
		if(ok)
			data.remove();
		res.json({"status":"OK"});
	});
};

apimanager.prototype.updatemachine	=	function(req, res)	{
	var db = this.db;
	var _this = this;
	db.CheckSession(req.body.sessionkey, function(ok, data)	{
		/** Checks if Session is Valid **/
		if(ok)	{
			var session = data;
			/** Checks if client sent the Machine Data **/
			if(req.body.hasOwnProperty("machinedata"))	{
				var machinedata = JSON.parse(req.body.machinedata);
				/** Sets owneruuid to session user **/
				machinedata.owneruuid = session.useruuid;
				/** Checks if its a new machine, or updating an older **/
				if(machinedata.machineuuid != null)	{
					/** If updating older, lets see if we can find the machineuuid and if its belongs to the session user **/
					db.Machines.find({"uuid":machinedata.machineuuid}, function(err, data)	{
						/** If we find, lets check the ownership **/
						if(data.length > 0)	{
							/** If belongs to the user, lets just update **/
							if(data[0].owneruuid == session.useruuid)	{
								if (data[0].current_status == 0)
									_this.control._SlackFunc("Estou de volta!", data[0].name);
				
								data[0].current_status = 1;
								data[0].lastupdate = Date.now();
								data[0].save();
								db.UpdateMachine(data[0].uuid, machinedata, function(uuid, data) {
									res.json({"status":"OK","machineuuid":uuid});
								});
							}
							else{
							/** If not, we create a new machine  and ignore the Machine UUID **/
								db.UpdateMachine(null, machinedata, function(uuid, data) {
									_this.control._SlackFunc("Olá, eu sou novo por aqui!", machinedata.name);
									res.json({"status":"OK","machineuuid":uuid});
								});	
							}	
						/** If not, just create one and ignore the UUID **/		
						}else
							db.UpdateMachine(null, machinedata, function(uuid, data) {
								_this.control._SlackFunc("Olá, eu sou novo por aqui!", machinedata.name);
								res.json({"status":"OK","machineuuid":uuid});
							});
					});
				/** If its new, just add it **/
				}else
					db.UpdateMachine(null, machinedata, function(uuid, data) {
						_this.control._SlackFunc("Olá, eu sou novo por aqui!", machinedata.name);
						res.json({"status":"OK","machineuuid":uuid});
					});
			}else
				res.json({"status":"NOK","code":"NOT_AUTHORIZED","error":"No Machine Data"});
		}else
			res.json({"status":"NOK","code":"NOT_AUTHORIZED", "error":"Not Authorized"});
	});
};


exports.api = apimanager;