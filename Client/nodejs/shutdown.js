var tvs		=	require("./tvs_tools.js");
var av 		= 	require("./alivecontrol.js");
var config 	=	require("./config.js");
var prompt 	= 	require('prompt');
var fs 		= 	require('fs');

//TODO: IMPORTANT! SOLVE THIS!!!
//I'm getting UNABLE_TO_VERIFY_LEAF_SIGNATURE error!
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

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
		DoUpdate();
	}
}catch(e)	{
	console.log("Session key not found. Login is necessary");
}

function DoUpdate()	{
	if(!dataConfig.hasOwnProperty("MachineUUID"))	{
		console.error("No machine to update status!");
		process.exit();
	}

	console.log("Sending");
	api.updatestate(dataConfig.MachineUUID, 0, dataConfig.Key, function(ok, machineuuid)	{
		if(ok)		{
			console.log("Machine Updated successfully! (",machineuuid,")");
		}else
			console.log("Error updating machine!");
	});
}

function onErr(err)	{
	console.log("An error ocurred: "+err);
}