var config = {
	"company_title"		: "TVS",
	"page_logo"			: "img/logo.png",
	"diskspace"			: {
		"critical"	: 5,
		"warning"	: 20
	}, 
	"internals" 		: {
		"mongodb"			: "mongodb://localhost/test",
		"max_twp_results"	: 10,
		"timings"			:	{
			"CheckSession"	: 10 * 60 * 1000,			//	10 minutes interval per session check    					(server-side)
			"CheckDisk"		: 24 * 60 * 60 * 1000,   	//  1 day interval per disk checks  							(server-side)
			"RefreshData"	: 5 * 60 * 1000, 			//	5 minute interval per page data refreshes 					(client-side)
			"CheckAlive"	: 5 * 60 * 1000,			//	5 minute interval per machine alive check   				(server-side)
			"MachineDead"	: 12 * 60 * 60 * 1000,		//	12 hour is the time server will consider a machine dead 	(server-side)
			"SMARTCheck"	: 24 * 60 * 60 * 1000,		//	24 hour interval between Smart Checks 						(server-side)	
		}
	},
	"WebUI_Parameters"	:	{
		"diskPercentCritical"		: 5,
		"diskPercentWarning" 		: 20,
		"diskSmartOK"				: ["PASSED"],
		"diskSmartProblem"			: ["FAIL","UNKNOWN!"]
	},
	"webserver"			: 	{
		"httpport"		: 82,
		"httpsport"		: 443,
		"httpsenable"	: true,
		"httpscert"		: "ssl/server.crt",
		"httpskey"		: "ssl/server.key",
		//"httpscabundle"	: "cabundle.pem" 	//	If needed
	}, 
};

exports.cfg = config;