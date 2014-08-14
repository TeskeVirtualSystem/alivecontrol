var EmuStore = {};

if(typeof(Storage) !== "undefined") {    console.log("Web Storage foi achado! Yupiii!");	} else {    alert("Seu browser não suporta Local Storage!");	}


function SetT(name, val)	{
	if(typeof(val) == "object")
		val = "[TVS_OBJ]"+JSON.stringify(val);
	if(typeof(Storage) !== "undefined")	
		localStorage[encodeT(name)] = encodeT(val);
	else
		EmuStore[encodeT(name)] = encodeT(val);
}
function GetT(name)		{	
	var data = 	decodeT((typeof(Storage) !== "undefined")?localStorage[encodeT(name)]:EmuStore[encodeT(name)]);
	return data == undefined ? undefined : (data.substr(0,9) == "[TVS_OBJ]" ? JSON.parse(data.substr(9)) : data);	
}
function ClearT()		{
	if(typeof(Storage) !== "undefined")	
		localStorage.clear();
	else
		EmuStore = {};
}
function DelT(name)	{
	if(typeof(Storage) !== "undefined")	
		localStorage.removeItem(encodeT(name));
	else
		delete EmuStore[encodeT(name)];
}

function encodeT(data)	{	return data == undefined || data == "undefined" ? undefined : btoa(data);	}
function decodeT(data)	{	return data == undefined || data == "undefined" ? undefined : atob(data);	}