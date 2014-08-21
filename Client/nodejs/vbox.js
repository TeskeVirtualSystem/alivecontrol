var sys = require('sys')
var exec = require('child_process').exec;

var vbox = function()   {
    this.vboxuser = false;
};

/**
 *  Gets the Virtualbox WEB User
 **/
vbox.prototype.GetUser = function(callback)    {
    var _this = this;
    var childuname = exec("cat /etc/default/virtualbox |grep VBOXWEB_USER|cut -d= -f2", function (error, stdout, stderr) {
        _this.vboxuser = stdout.replace("\n","");
        console.log("VBox User: "+_this.vboxuser);
        if(callback != undefined)
            callback(_this.vboxuser);
    });
};

/**
 *  Gets the Virtualbox Virtual Machines
 **/
vbox.prototype.GetMachines  =   function(callback)  {
    var regexname = /(?=([^\"]*\"[^\"]*\")*[^\"]*$)/;
    var regexuuid = /\{(.*?)\}/;
    var _this = this;
    var childuname = exec("su "+this.vboxuser+" -c \"VBoxManage list vms\"", function (error, stdout, stderr) {
        var list = stdout.split("\n");
        _this.machines = [];
        for(var i in list)  {
            if(list[i] != "")   {
                var machinename =   regexname.exec(list[i])[1].replace("\"","").replace("\"","");
                var uuid        =   regexuuid.exec(list[i])[1];
                console.log("Machine: "+machinename+" - UUID: "+uuid);
                _this.machines.push({"uuid":uuid,"name":machinename});
            }
        }
        if(callback != undefined)
            callback(_this.machines);
    });
};


/**
 *  Gets the Virtualbox Virtual Running Machines
 **/
vbox.prototype.GetRunningMachines  =   function(callback)  {
    var regexname = /(?=([^\"]*\"[^\"]*\")*[^\"]*$)/;
    var regexuuid = /\{(.*?)\}/;
    var _this = this;
    var childuname = exec("su "+this.vboxuser+" -c \"VBoxManage list runningvms\"", function (error, stdout, stderr) {
        var list = stdout.split("\n");
        var machines = [];
        for(var i in list)  {
            if(list[i] != "")   {
                var machinename =   regexname.exec(list[i])[1].replace("\"","").replace("\"","");
                var uuid        =   regexuuid.exec(list[i])[1];
                console.log("Machine: "+machinename+" - UUID: "+uuid);
                machines.push({"uuid":uuid,"name":machinename});
            }
        }
        if(callback != undefined)
            callback(machines);
    });
};


/**
 *  Gets the Virtualbox VM Info
 **/
vbox.prototype.GetVMInfo = function(vm, callback)   {
        console.log("su "+this.vboxuser+" -c 'VBoxManage showvminfo \""+vm+"\"'");
       var childuname = exec("su "+this.vboxuser+" -c 'VBoxManage showvminfo \""+vm+"\"'", function (error, stdout, stderr) {
        var list = stdout.split("\n");
        var data = {};
        for(var i in list)  {
            if(list[i] != "")   {
                var item = list[i].split(":", 1)[0].trim();
                var item2 = list[i].replace(item+":","").trim();
                data[item] = item2;
            }
        }
        if(callback != undefined)
            callback(data);
    }); 
};

/**
 *  Test prototype
 **/
vbox.prototype.Init   =   function()  {
    var _this = this;
    this.GetUser(function()  {
        _this.GetMachines();
        _this.GetVMInfo("d044a492-bb71-47b1-9458-62964295f192");
    });
};

exports.vbox = vbox;