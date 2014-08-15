var vbox	= 	require("./vbox.js");
var tvs		=	require("./tvs_tools.js");
var av 		= 	require("./alivecontrol.js");
var config 	=	require("./config.js");
var prompt 	= 	require('prompt');
var fs 		= 	require('fs');

console.log("Initializing API");
console.log("API in "+config.ServerURL);
var api 	= 	new av.alivecontrol(config.ServerURL);

var dataConfig;
var AllOKToRun = false;

console.log("Trying to find dataConfig file (data.json)");
try{
	dataConfig 	= 	fs.readFileSync("data.json", {"encoding":"utf8"});
	dataConfig	=	JSON.parse(dataConfig);
	if(!dataConfig.hasOwnProperty("Key"))
		throw("No Session Key");
	else{
		console.log("Session key found in dataConfig");
		AllOKToRun  = true;
	}
}catch(e)	{
	console.log("Session key not found. Login is necessary");
	DoLogin();
}

CheckOK();


function DoUpdate()	{
	console.log("Doing update");
	var machinedata				=	{
		name: dataConfig.MachineName
	}
	if(dataConfig.hasOwnProperty("MachineUUID"))	{
		console.log("Good! We already sent this once :D");
		machinedata.machineuuid = dataConfig.MachineUUID;
	}
	console.log("Getting CPU Info");
	var cpu 					= 	tvs.GetCPUInfo();
	console.log("Getting Memory Info");
	var mem 					= 	tvs.GetMemInfo();
	console.log("Getting Devices Info");
	var devs 					= 	tvs.GetDevicesInfo();
	console.log("Getting Network Usage"); 
	var nets					=	tvs.GetNetworkUsage();
	console.log("Getting Disk Usage");
	var disksuse				=	tvs.GetDiskUsage();
	console.log("Getting Uptime");
	var uptime					=	tvs.GetUpTime();
	console.log("Getting DRBD Info");
	var drbd 					=	tvs.GetDRBDInfo();
	console.log("Getting Disks");
	var disks 					=	tvs.GetDiskList();
	console.log("Getting SmartData");
	var smart 					=	[];
	for(var i in disks)	{
		var sm = tvs.GetSmartData(disks[i]);
		if(sm != null)
			smart.push(sm);
	}
	console.log("Getting 3Ware Smart Data");
	var sm3ware 				=	tvs.Get3WareSmartData();
	for(var i in sm3ware)
		smart.push(sm3ware[i]);

	machinedata.processor 		= 	cpu.cpu_model_name;
	machinedata.total_memory	=	mem.total;
	machinedata.free_memory		=	mem.free;
	machinedata.total_swap		=	mem.swaptotal;
	machinedata.free_swap		=	mem.swapfree;
	machinedata.uptime			=	uptime;

	machinedata.devices 		=	[];
	for(var i in devs)	{
		machinedata.devices.push({
			"name"		: devs[i],
			"type"		: "pci"
		});
	}

	machinedata.ethernets		=	[];
	for(var i in nets)	{
		machinedata.ethernets.push({
			"iface"			: nets[i].Device, 
			"address"		: nets[i].IP,
			"broadcast"		: nets[i].Broadcast,
			"netmask"		: nets[i].NetMask,
			"rxbytes"		: nets[i].RX,
			"txbytes"		: nets[i].TX
		});
	}

	machinedata.mounts			=	[];
	for(var i in disksuse)	{
		machinedata.mounts.push({
			"mountpoint"	: disksuse[i].MountPoint, 
			"device"		: disksuse[i].Device,
			"used"			: disksuse[i].Used,
			"free"			: disksuse[i].Free,
			"size"			: disksuse[i].Size,
		});
	}

	machinedata.disks  				=	[];
	for(var i in smart)	{
		var sm = smart[i];
		machinedata.disks.push({
			"family"			: sm.ModelFamily,
			"capacity"  		: sm.UserCapacity,
			"ontime"			: sm.PowerOnHours,
			"powercycles"		: sm.PowerCycleCount,
			"readerrors"		: sm.ReadErrorRate,
			"realocatedsectors"	: sm.ReallocatedSector,
			"diskstatus"		: sm.DiskHealth,
			"device" 			: sm.Device
		});
	}

	console.log("Sending");
	api.updatemachine(machinedata, dataConfig.Key, function(ok, machineuuid)	{
		if(ok)		{
			console.log("Machine Updated successfully! (",machineuuid,")");
			if(!dataConfig.hasOwnProperty("MachineUUID"))	{
				console.log("This machine doesnt have an UUID. Saving "+machineuuid+" to data.json");
				dataConfig.MachineUUID = machineuuid;
				SaveDataConfig();
				console.log("Finished");
			}
		}else
			console.log("Error updating machine!");
	});
}

function CheckOK()	{
	if(AllOKToRun)	
		DoUpdate();
	else
		setTimeout(CheckOK, 1000);
}


function SaveDataConfig()	{
	var d = JSON.stringify(dataConfig);
	fs.writeFileSync("data.json", d, {"encoding":"utf8"});
}


function DoLogin()	{
	prompt.get(['username', 'password', 'machinename'], function (err, result) {
    	if (err) { return onErr(err); }
    	console.log("Trying to login");
		api.login(result.username,result.password,-1,function(ok, key, uuid)	{
			if(ok)	{
				console.log("Logged in. Session key: ",key," User UUID: ",uuid);
				dataConfig = {
					"UUID"			: uuid,
					"Key" 			: key,
					"MachineName"	: result.machinename
				};
				console.log("Saving DataConfig");
				SaveDataConfig();
				AllOKToRun = true;
			}else{
				console.log("Invalid username or password. ");
				DoLogin();
			}
		});
  	});
}

function onErr(err)	{
	console.log("An error ocurred: "+err);
}