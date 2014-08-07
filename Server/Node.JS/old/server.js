var express     =   require('express');
var http        =   require('http');
var manager     =   require('./manager.js').manager;


var webapp      =   express();
var httpserver  =   http.createServer(webapp);

man = new manager({
    myuser      :   "alivecontrol",
    mypass      :   "MqHALGF8BLuhRdHR",
    mydb        :   "alivecontrol",
    myhost      :   "localhost",
    mailhost    :   "voz.com.br",
    mailuser    :   "lucas@voz.com.br",
    mailpass    :   "nsdopc2509",
    
    mailfrom    :   "lucas@teske.net.br",
    mailfromname:   "Lucas Teske",
    mailto      :   "lucas@voz.com.br",
    mailtoname  :   "Lucas Teske",
    
    mailtext    :   "[MACHINE] - [TIMEOUT]",
    mailhtml    :   "[MACHINE] - [TIMEOUT] - [SERVER] - [TIME]",
    roundtime   :   5,
    timeout     :   10*60
});

webapp.post("/api", function(req, res)    {
    if(req.body.action != undefined)    {
        switch(req.body.action) {
            "updatemachine":
            
                break;
            "addmachine":
                man.CheckUser(req.body.username,req.body.password,function(ok,msg,data) {
                    if(ok)  {
                    
                    }else
                        res.send(JSON.stringify({"code":"NO_AUTHORIZED"});
                });            
                break;
            default:
                res.send(JSON.stringify({"code":"NO_ACTION"});
        }
    }else
        res.send(JSON.stringify({"code":"NO_ACTION"});
    /*
    if(DB.CheckUser(req.body.username,req.body.password))   {
        var sid = Sessions.CreateSession({"username":req.body.username,"password":DB.Hash(req.body.password)});
        res.cookie('SessionID', sid, { expires: new Date(Date.now() + 1400*1000)});
        res.send(JSON.stringify({"code":"OK"}));
    }else
        res.send(JSON.stringify({"code":"LOGIN_FAIL"}));
    */
});

httpserver.listen(90)
