var av = require("./alivecontrol.js");
var tvs = require("./tvs_tools.js");
var api = new av.alivecontrol("http://localhost:82");


/*
api.logout("e8e6b8d0-2181-11e4-8f87-1d7c5e97432a",function(ok)	{
	if(ok)	
		console.log("Logged out!");
	else
		console.log("An error ocurred when logging out!");
});

api.login("lucas","2509",function(ok, key, uuid)	{
	if(ok)	
		console.log("Logged in. Session key: ",key," User UUID: ",uuid);
	else
		console.log("An error ocurred when logging in!");
});
*/
var sessionkey = "01973050-2185-11e4-9fc6-4f911a885868";
var uuid = "01f4c670-1e60-11e4-adca-7d832b816a3a";


var machinedata	=	{
	name: "HUE's machine",
	machineuuid: "b1514da0-2185-11e4-be36-c74e4f3d97f2"
}

var cpu 					= 	tvs.GetCPUInfo();
var mem 					= 	tvs.GetMemInfo();
var devs 					= 	tvs.GetDevicesInfo();
var nets					=	tvs.GetNetworkUsage();
var disksuse				=	tvs.GetDiskUsage();
var uptime					=	tvs.GetUpTime();

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

api.updatemachine(machinedata, sessionkey, function(ok, machineuuid)	{
	if(ok)	
		console.log("Machine Updated successfully! (",machineuuid,")");
	else
		console.log("Error updating machine!");
});