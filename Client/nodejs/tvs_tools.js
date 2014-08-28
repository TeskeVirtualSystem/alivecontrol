/**
 *	This is an port of Python version of TVS Tools from SM Monitor
 **/

var sys 		= 	require('sys')
var exec 		= 	require('child_process').exec;
var execSync 	= 	require('exec-sync');
var fs 			= 	require('fs');

console.warn("Warning: TVS Tools uses syncronous calls. This should be ONLY used for scripts and local applications.");
console.warn("Keep in mind that syncronous calls blocks the program until it finished.");

var inetRegex 	= 	/inet addr:([0-9]*).([0-9]*).([0-9]*).([0-9]*)/;
var bcastRegex 	= 	/Bcast:([0-9]*).([0-9]*).([0-9]*).([0-9]*)/;
var maskRegex 	=	/Mask:([0-9]*).([0-9]*).([0-9]*).([0-9]*)/;
var TXRegex		=	/TX bytes:([0-9]*)/;
var RXRegex		=	/RX bytes:([0-9]*)/;


/**
 *	Got from http://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript
 *  Cleans the array from empty elements
 **/
function cleanArray(actual)	{
  var newArray = new Array();
  for(var i = 0; i<actual.length; i++){
      if (actual[i]){
        newArray.push(actual[i]);
    }
  }
  return newArray;
}

/**
 *	Got from http://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript
 *  Checks if the string/float/int is a number
 **/
function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); } 

function secondsToTime(secs)	{
    secs = Math.round(secs);
    var hours = Math.floor(secs / (60 * 60));
    var days = Math.floor(hours / 24);

    hours -= days * 24;

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    return obj = {
    	"d": days,
        "h": hours,
        "m": minutes,
        "s": seconds
    };
}

/**
 *	Converts the following value to a numeric base one like 1.2k for 1200
 *  Returns an array with first element the reduced number (1.2) and the second the notation unit (k)
 **/
function toNotationUnit(value, base)	{
 	if(base == null || base == undefined)
 		base = 10;
    var units = [ 'y','z','a','f','p','n','u','m',' ', 'K','M','G','T','P','E','Z','Y'] ;
    var counter = 8;
    var div = 1.0;
    if(base == 10)	
    	div = 1000.0;
    else if(base == 2)	
    	div = 1024.0;
    else{
    	// TODO: Other bases, maybe?
    	console.log("Unsuported base!");
    	return null;
    }

    val = value > 0 ? value : -value
    if(val < 1)	{
        while(( val < 1.00) && !(counter == 0))	{
            counter = counter - 1;
            val = val * div;
        }
    }else{
        while(( val >= div ) && !(counter == 16))	{
            counter = counter + 1;
        	val = val / div;
        }
    }	
	return [ ( value > 0 ? val : -val) , units[counter]]   
}

function fromNotationUnit(value, base, trail)	{
    var units = [ 'y','z','a','f','p','n','u','m',' ', 'K','M','G','T','P','E','Z','Y'] ;
    if(trail == undefined) 	trail = 0;
 	if(base == null || base == undefined)	base = 10;
 	if(value.substr(-1,1) == "B")		trail = 1;
 	if(value.substr(-2,2) == "iB")		trail = 2;
    var unit 	= 	value.substr(-1-trail,1);
    var value 	= 	parseFloat(value);
    var exp 	=	3*(units.indexOf(unit)-8);
    if(exp == -27)	//	not found
    	return value;
    else{
    	if(base == 2) { base = 1024; exp /= 3; }
    	return value * Math.pow(base,exp);
    }
}

exports.toNotationUnit = toNotationUnit;

/**
 *	Does an log to syslog and console
 **/
exports.LOG 	=	function(msg)	{
	// TODO: Output to syslog
	console.log("SMMON: ",msg);
}

/**
 *	Does an warn log to syslog and console
 **/
exports.WARN 	=	function(msg)	{
	// TODO: Output to syslog
	console.warn("SMMON: ",msg);
}

/**
 *	Does an Syncronous Shell Command
 **/
function ExecuteShell(cmd)	{
	return execSync(cmd);
}
exports.ExecuteShell = ExecuteShell;

/**
 *	Get the local disk list
 **/
exports.GetDiskList			=	function()	{
	var disks = ExecuteShell('ls /sys/block/ |grep "sd\\|xvd\\|drbd"');
	return cleanArray(disks.split("\n"));
}

/**
 *	Get the Smart Data for a disk
 **/
exports.GetSmartData		=	function(disk)	{
	var data = ExecuteShell("smartctl -d sat -a /dev/"+disk);
	if(data.indexOf("START OF INFORMATION SECTION") > -1 )	{
            ModelFamily          =    ExecuteShell('smartctl -d sat -a /dev/'+disk+' | grep "Model Family" | cut -d: -f2').trim()
            DeviceModel          =    ExecuteShell('smartctl -d sat -a /dev/'+disk+' | grep "Device Model" | cut -d: -f2').trim()
            UserCapacity         =    ExecuteShell('smartctl -d sat -a /dev/'+disk+' | grep "User Capacity" | cut -d: -f2' ).trim().split("bytes")[0].trim().replace(/\./g,"").replace(/,/g,"")
            DiskHealth           =    ExecuteShell('smartctl -d sat -a /dev/'+disk+' | grep "SMART overall-health" | cut -d: -f2').trim()
            PowerOnHours         =    ExecuteShell('smartctl -d sat -a /dev/'+disk+' | grep "Power_On_Hours"').trim().split(' ')
            PowerOnHours         =    PowerOnHours[PowerOnHours.length-1]
            PowerCycleCount      =    ExecuteShell('smartctl -d sat -a /dev/'+disk+' | grep "Power_Cycle_Count"').trim().split(' ')
            PowerCycleCount      =    PowerCycleCount[PowerCycleCount.length-1]
            ReadErrorRate        =    ExecuteShell('smartctl -d sat -a /dev/'+disk+' | grep "Raw_Read_Error_Rate"').trim().split(' ')
            ReadErrorRate        =    ReadErrorRate[ReadErrorRate.length-1]    
            ReallocatedSector    =    ExecuteShell('smartctl -d sat -a /dev/'+disk+' | grep "Reallocated_Sector_Ct"').trim().split(' ')    
            ReallocatedSector    =    ReallocatedSector[ReallocatedSector.length-1]			
            return { 
            	"Device"				: "/dev/"+disk, 
            	"ModelFamily" 			: ModelFamily, 
            	"DeviceModel" 			: DeviceModel, 
            	"UserCapacity" 			: UserCapacity, 
            	"DiskHealth"			: DiskHealth, 
            	"PowerOnHours" 			: PowerOnHours, 
            	"PowerCycleCount" 		: PowerCycleCount, 
            	"ReadErrorRate" 		: ReadErrorRate, 
            	"ReallocatedSector" 	: ReallocatedSector 
            }
	}else
		return null;
}

/**
 *	Initializes 3Ware Smart Controller
 **/
exports.Init3WareSmart		=	function()	{	ExecuteShell("smartctl -d 3ware,0 /dev/twa0");	}

/**
 *	Initializes 3Ware controller and get smartdata from its devices
 **/
exports.Get3WareSmartData	=	function()	{
	exports.Init3WareSmart();
	var smlist = [];
	for(var i=0;i<12;i++)	{
		var data = ExecuteShell("smartctl -a -d 3ware,"+i+" /dev/twa0 ");
		if(data.indexOf("START OF INFORMATION SECTION") > -1)	{
	            ModelFamily          =    ExecuteShell('smartctl -a -d 3ware,'+i+' /dev/twa0 | grep "Model Family" | cut -d: -f2').trim()
	            DeviceModel          =    ExecuteShell('smartctl -a -d 3ware,'+i+' /dev/twa0 | grep "Device Model" | cut -d: -f2').trim()
	            UserCapacity         =    ExecuteShell('smartctl -a -d 3ware,'+i+' /dev/twa0 | grep "User Capacity" | cut -d: -f2' ).trim().split("bytes")[0].trim().replace(/\./g,"").replace(/,/g,"")
	            DiskHealth           =    ExecuteShell('smartctl -a -d 3ware,'+i+' /dev/twa0 | grep "SMART overall-health" | cut -d: -f2').trim()
	            PowerOnHours         =    ExecuteShell('smartctl -a -d 3ware,'+i+' /dev/twa0 | grep "Power_On_Hours"').trim().split(' ')
	            PowerOnHours         =    PowerOnHours[PowerOnHours.length-1]
	            PowerCycleCount      =    ExecuteShell('smartctl -a -d 3ware,'+i+' /dev/twa0 | grep "Power_Cycle_Count"').trim().split(' ')
	            PowerCycleCount      =    PowerCycleCount[PowerCycleCount.length-1]
	            ReadErrorRate        =    ExecuteShell('smartctl -a -d 3ware,'+i+' /dev/twa0 | grep "Raw_Read_Error_Rate"').trim().split(' ')
	            ReadErrorRate        =    ReadErrorRate[ReadErrorRate.length-1]    
	            ReallocatedSector    =    ExecuteShell('smartctl -a -d 3ware,'+i+' /dev/twa0 | grep "Reallocated_Sector_Ct"').trim().split(' ')    
	            ReallocatedSector    =    ReallocatedSector[ReallocatedSector.length-1]			
	            smlist.push({ 
	            	"Device"				: "3ware,"+i, 
	            	"ModelFamily" 			: ModelFamily, 
	            	"DeviceModel" 			: DeviceModel, 
	            	"UserCapacity" 			: UserCapacity, 
	            	"DiskHealth"			: DiskHealth, 
	            	"PowerOnHours" 			: PowerOnHours, 
	            	"PowerCycleCount" 		: PowerCycleCount, 
	            	"ReadErrorRate" 		: ReadErrorRate, 
	            	"ReallocatedSector" 	: ReallocatedSector 
	            });
		}		
	}
	return smlist;
}

/**
 *	Get the disk usage
 **/
exports.GetDiskUsage	=	function()	{
	var disks = [];
	var data = cleanArray(ExecuteShell('df |grep "/dev/sd\\|/dev/xvd\\|/dev/mapper/\\|/dev/drbd"').split("\n"));
	for(var i in data)	{
		var dsk = cleanArray(data[i].split(" "));
		disks.push({ 
			'Device' 		: dsk[0], 
			'Size' 			: parseInt(dsk[1])*1000, 
			'Used' 			: parseInt(dsk[2])*1000, 
			'Free' 			: parseInt(dsk[3])*1000, 
			'UsedPercent' 	: dsk[4], 
			'MountPoint' 	: dsk[5] 
		});
	}
	return disks;
}

/**
 *	Get Network Device Data
 **/
exports.GetNetDevData	=	function(dev)	{
	//var devdata 		= 	{ 'Device' : dev, "TX" : "(0.0 B)", "RX" : "(0.0 B)", "IP" : "Unknown", "Broadcast" : "Unknown", "NetMask" : "Unknown" };
	var devdata 		= 	{ 'Device' : dev, "TX" : 0, "RX" : 0, "IP" : "Unknown", "Broadcast" : "Unknown", "NetMask" : "Unknown" };
	var netstring 		= 	ExecuteShell('LANG="en_US.UTF-8" LANGUAGE="en" ifconfig '+dev);
	var ip 		= "Unknown",
		bcast 	= "Unknown", 
		mask 	= "Unknown";

	try	{	ip 		= 	inetRegex.exec(netstring).slice(1).join(".");	}catch(e)	{};
	try	{	bcast 	= 	bcastRegex.exec(netstring).slice(1).join(".");	}catch(e)	{};
	try	{	mask 	=	maskRegex.exec(netstring).slice(1).join(".");	}catch(e)	{};
	
	//var tx 				=	toNotationUnit(parseInt(TXRegex.exec(netstring).slice(1)[0]));
	//var rx 				=	toNotationUnit(parseInt(RXRegex.exec(netstring).slice(1)[0]));
	var tx 				=	parseInt(TXRegex.exec(netstring).slice(1)[0]);
	var rx 				=	parseInt(RXRegex.exec(netstring).slice(1)[0]);

	devdata.IP  		=	ip;
	devdata.Broadcast	=	bcast;
	devdata.NetMask		=	mask;
	devdata.TX 			=	tx;
	devdata.RX 			=	rx;
	return devdata;
}

/**
 *	Get the network devices on the machine
 **/
exports.GetNetworkDevices	=	function()	{
	var data = cleanArray(ExecuteShell('cat /proc/net/dev').split('\n')).slice(2);
	var devices = [];
	for(var i in data)	
		devices.push(data[i].split(":",1)[0].trim());
	
	return devices;
}

/**
 *	Get the network usage for all devices
 **/
exports.GetNetworkUsage		=	function()	{
	var devices = exports.GetNetworkDevices();
	var usages = [];
	for(var i in devices)
		usages.push(exports.GetNetDevData(devices[i]));
	return usages;
}


/**
 *	Get PCI/PCI-e devices list
 **/
exports.GetDevicesInfo		=	function()	{
	var devices = ExecuteShell("lspci").split("\n");
	for(var i in devices)	
		devices[i] = devices[i].substr(8);
	
	return devices;
}

/**
 *	Get the Memory Info (RAM and Swap)
 **/
exports.GetMemInfo			=	function()	{
	var total		=	parseInt(ExecuteShell("cat /proc/meminfo |grep MemTotal  | cut -d: -f2").trim().slice(0,-3))*1000;
	var free		=	parseInt(ExecuteShell("cat /proc/meminfo |grep MemFree   | cut -d: -f2").trim().slice(0,-3))*1000;
	var swaptotal	=	parseInt(ExecuteShell("cat /proc/meminfo |grep SwapTotal | cut -d: -f2").trim().slice(0,-3))*1000;
	var swapfree	=	parseInt(ExecuteShell("cat /proc/meminfo |grep SwapFree  | cut -d: -f2").trim().slice(0,-3))*1000;

	return {
		"total"			:  total,
		"free"			:  free,
		"swaptotal"		:  swaptotal,
		"swapfree"		:  swapfree
	};
}

/**
 *	Get System Uptime
 **/
exports.GetUpTime			=	function()	{
	var uptime 		=	parseFloat(ExecuteShell("cat /proc/uptime").split(" ")[0])
	uptime 			= 	secondsToTime(uptime);
	return uptime.d + " days " + uptime.h + " hours " + uptime.m + " minutes " + uptime.s + " seconds";
}

/**
 *	Get the CPU Info
 **/
exports.GetCPUInfo			=	function()	{

    var cpu_family         	=    ExecuteShell('cat /proc/cpuinfo |grep "cpu family" |head -n1 |cut -d: -f2').trim();
    var cpu_model         	=    ExecuteShell('cat /proc/cpuinfo |grep "model" |head -n1 |cut -d: -f2').trim();
    var cpu_model_name     	=    ExecuteShell('cat /proc/cpuinfo |grep "model name" |head -n1 |cut -d: -f2').trim();
    var cpu_stepping    	=    ExecuteShell('cat /proc/cpuinfo |grep "stepping" |head -n1 |cut -d: -f2').trim();
    var cpu_cores        	=    ExecuteShell('cat /proc/cpuinfo |grep "cpu cores" |head -n1 |cut -d: -f2').trim();
    var cpu_bogomips    	=    ExecuteShell('cat /proc/cpuinfo |grep "bogomips" |head -n1 |cut -d: -f2').trim();
    return { 
    	'cpu_family' 		: 	cpu_family, 
    	'cpu_model' 		: 	cpu_model, 
    	'cpu_model_name' 	: 	cpu_model_name, 
    	'cpu_stepping' 		: 	cpu_stepping, 
    	'cpu_cores' 		: 	cpu_cores, 
    	'cpu_bogomips' 		: 	cpu_bogomips 
    }
}

/**
 *	Get DRBD Info
 **/
exports.GetDRBDInfo			=	function()	{
	var drbdinfo = {"conn" : {}}
	try	{
		var f = fs.readFileSync("/proc/drbd",{"encoding":"utf8"});
		drbdinfo.has = true;
		drbdinfo.conn = [];
		drbdinfo.drbdfile = f;
		f = cleanArray(f.split("\n"));
		var lastdigit = null;
		for(var l in f)	{
			var line = f[l];
			block = line.split(":",1);
			block[1] = line.substr(block[0].length+1)
			block[0] = block[0].trim();
			block[1] = block[1].trim();
			if(block[0].indexOf("srcversion") > -1 )
				drbdinfo.srcversion = block[1];
			else if(block[0].indexOf("version") > -1)
				drbdinfo.version = block[1];
			else if(isNumber(block[0]))	{
				lastdigit = parseInt(block[0]);
				drbdinfo.conn[lastdigit] = {};
				d2 = cleanArray(block[1].split(" "));
				for(var i in d2)	{
					d = d2[i];
					o = d.split(":");
					if(o.length > 1)
						drbdinfo.conn[lastdigit][o[0]] = o[1];
				}
			}else{
				if(lastdigit == null)
					exports.WARN("Problemas ao ler partes do DRBD! - Linha: \n ",line," \n\n /proc/drbd : \n ",f.join("\n"));
				else
					drbdinfo["conn"][lastdigit][block[0]] = block[1];
			}

		}
	}catch(e)	{
		drbdinfo.has = false;
	}

	return drbdinfo;
}

/**
 *	Get MySQL Slave Status
 **/
exports.GetMySQLSlave	=	function(hostname, username, password, cb)	{
	// TODO
	cb();
}

/**
 *	Get Linux Version
 **/

exports.GetOSVersion	=	function()	{
	var OS 		=	ExecuteShell('uname -s');
	var REV 	= 	ExecuteShell('uname -r');
	var MACH 	=	ExecuteShell('uname -m');
	var output  =   "Unknown";
	if(OS == "SunOS")	
		output = "Sun OS ("+MACH+")";
	else if(OS == "Linux")	{
		if(fs.existsSync("/etc/redhat-release"))	{
			output = "RedHat "+ExecuteShell('cat /etc/redhat-release | sed s/.*\\(// | sed s/\\)//') + " ("+MACH+")";
		}else if(fs.existsSync("/etc/SUSE-release"))	{
			output = ExecuteShell('cat /etc/SUSE-release | tr "\\n" \' \'| sed s/VERSION.*//') + " ("+MACH+")";
		}else if(fs.existsSync("/etc/mandrake-release"))	{
			output = "Mandrake "+ExecuteShell('cat /etc/mandrake-release | sed s/.*\\(// | sed s/\\)//') + " ("+MACH+")";
		}else if(fs.existsSync("/etc/debian-version"))	{
			output = "Debian "+ExecuteShell('cat /etc/debian_version')+" ("+MACH+")";
		}else if(fs.existsSync("/etc/lsb-release"))	{
			output = ExecuteShell('cat /etc/lsb-release |grep DESCRIPTION | cut -d= -f2').replace(/\"/g,"") + " ("+MACH+")";
		}else
			output = "Linux ("+MACH+")";	
	}else
		output = OS + " ("+MACH+")";
	
	return output;
}



/**
 *  Gets the Virtualbox WEB User
 **/
exports.GetVBoxUser = function()    {
	try{
	    return ExecuteShell("cat /etc/default/virtualbox |grep VBOXWEB_USER|cut -d= -f2").replace("\n","").trim();
	}catch(e){
		console.log("Error Getting Vbox user: "+e);
		return undefined;
	}	
};

/**
 *  Gets the Virtualbox Virtual Machines
 **/
exports.GetVBoxMachines  =   function()  {
    var regexname 	= /(?=([^\"]*\"[^\"]*\")*[^\"]*$)/;
    var regexuuid 	= /\{(.*?)\}/;
    var machines 	= [];
    var user = this.GetVBoxUser();
    if(user !== undefined && user !== "")	{
	    var list = ExecuteShell("sudo su "+user+" -c \"VBoxManage list vms\"").split("\n");
	    for(var i in list)	{
	        if(list[i].trim() != "")   {
	            var machinename =   regexname.exec(list[i])[1].replace("\"","").replace("\"","").trim();
	            var uuid        =   regexuuid.exec(list[i])[1].trim();
	            //console.log("Machine: "+machinename+" - UUID: "+uuid);
	            machines.push({"uuid":uuid,"name":machinename});
	        }    	
	    }
	}
    return machines;
};


/**
 *  Gets the Virtualbox Virtual Running Machines
 **/
exports.GetVBoxRunningMachines  =   function()  {
    var regexname 	= /(?=([^\"]*\"[^\"]*\")*[^\"]*$)/;
    var regexuuid 	= /\{(.*?)\}/;
    var user 		= this.GetVBoxUser();
    var machines 	= [];
    if(user !== undefined && user !== "")	{
	    var list = ExecuteShell("sudo su "+user+" -c \"VBoxManage list runningvms\"").split("\n");
	    for(var i in list)  {
	        if(list[i] != "")   {
	            var machinename =   regexname.exec(list[i])[1].replace("\"","").replace("\"","").trim();
	            var uuid        =   regexuuid.exec(list[i])[1].trim();
	            //console.log("Machine: "+machinename+" - UUID: "+uuid);
	            machines.push({"uuid":uuid,"name":machinename});
	        }
	    }
	}
    return machines;
};


/**
 *  Gets the Virtualbox VM Info
 **/
exports.GetVBoxVMInfo = function(vm)   {
    var user = this.GetVBoxUser();
	var data = {};
	if(user != undefined && user !== "")	{
		var list = ExecuteShell("sudo su "+user+" -c 'VBoxManage showvminfo \""+vm+"\" --machinereadable'").split("\n");
		for(var i in list)  {
			if(list[i] != "")   {
			    var item = list[i].split("=", 1)[0].trim();
			    var item2 = list[i].replace(item+"=","").replace(/\"/g,"").trim();
			    data[item] = item2;
			}
		}
	}
	return data;
};

/**
 * Gets the AC Virtual Machine list
 **/

 exports.GetVBoxACList = function()	{
 	var machines = this.GetVBoxMachines();
 	var data = [];
 	for(var i in machines)	{
 		var mdata = this.GetVBoxVMInfo(machines[i].uuid);
 		var status = -1;
 		if(mdata["VMState"].indexOf("poweroff") > -1)
 			status = 0;
 		else	if(mdata["VMState"].indexOf("running") > -1)
 			status = 1;
 		else	if(mdata["VMState"].indexOf("saving") > -1)
 			status = 2;
 		else	if(mdata["VMState"].indexOf("saved") > -1)
 			status = 3;
 		else	if(mdata["VMState"].indexOf("aborted") > -1)
 			status = 4;
 		else	if(mdata["VMState"].indexOf("restoring") > -1)
 			status = 5;

 		data.push({
			name				: mdata.name,
			guestos				: mdata["ostype"],
			memory 				: parseInt(mdata["memory"])*1024*1024,
			cpus				: parseInt(mdata["cpus"]),
			type				: "Virtualbox",
			status 				: status
 		});
 	}
 	return data;
 }

exports.GetKVMNodeArch	=	function()	{
	return ExecuteShell("virsh nodeinfo | grep \"CPU model\"|cut -d: -f2").trim();
}

exports.GetKVMVms	=	function()	{
	try{
		var data = ExecuteShell("virsh list --all | tail -n +3 | awk '{print $2}'").split("\n");
		var vms = [];
		for(var i in data)	{
			if(data[i].trim() != "")	{
				vms.push(this.GetKVMVMInfo(data[i].trim()));
			}
		}
		return vms;
	}catch(e)	{
		console.log("Error getting KVM VMs: ",e);
		return [];
	}
}

exports.GetKVMVMInfo	=	function(vmname)	{
	var data = ExecuteShell("virsh dominfo \""+vmname+"\"").split("\n");	
	var mdata = {};
	var arch = this.GetKVMNodeArch();
	for(var i in data)	{
	    var item = list[i].split(":", 1)[0].trim();
	    var item2 = list[i].replace(item+":","").replace(/\"/g,"").trim();
	    mdata[item] = item2;
	    if(item == "OS Type")
	    	mdata[item] += " ("+arch+")";
	}
	return mdata;
}

exports.GetKVMACList	=	function()	{
 	var machines = this.GetKVMVms();
 	var data = [];
 	for(var i in machines)	{
 		var mdata = machines[i];
 		var status = -1;
 		if(mdata["State"].indexOf("stopped") > -1 || mdata["State"].indexOf("defined") > -1)
 			status = 0;
 		else	if(mdata["State"].indexOf("running") > -1)
 			status = 1;
 		else	if(mdata["State"].indexOf("saving") > -1)
 			status = 2;
 		else	if(mdata["State"].indexOf("saved") > -1)
 			status = 3;
 		else	if(mdata["State"].indexOf("aborted") > -1)
 			status = 4;
 		else	if(mdata["State"].indexOf("restoring") > -1)
 			status = 5;

 		data.push({
			name				: mdata.Name,
			guestos				: mdata["OS Type"],
			memory 				: fromNotationUnit(mdata["Max memory"],2,2),
			cpus				: parseInt(mdata["CPU(s)"]),
			type				: "KVM",
			status 				: status
 		});
 	}
 	return data;
}