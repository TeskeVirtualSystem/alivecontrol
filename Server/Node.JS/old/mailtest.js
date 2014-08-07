var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "voz.com.br",
    host: "voz.com.br",
    port: 587,
    auth: {
        user: "lucas@voz.com.br",
        pass: "nsdopc2509"
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: "Lucas Teske <lucas@voz.com.br>", // sender address
    to: "Lucas Teske <lucas@teske.net.br>", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world ✔", // plaintext body
    html: "<b>Hello world ✔</b>", // html body
    headers:    {
        "X-MASTER" : "HUE"
    }
}

// send mail with defined transport object
smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }

    // if you don't want to use this transport object anymore, uncomment following line
    smtpTransport.close(); // shut down the connection pool, no more messages
});
