var bcrypt = require('bcryptjs');
var crypto = require('crypto');



var password    =   "HUEBR?BRBRBRBRBR";

var AESIV       =   bcrypt.genSaltSync(31).substr(13,16);

var AESKEY_HASH =   crypto.createHash('sha256');
    AESKEY_HASH.update(password);
    AESKEY      =   AESKEY_HASH.digest('base64');
    
var cipher      =   crypto.createCipher('aes-256-ecb', new Buffer(AESKEY, 'base64'));    //  IV Not used


var salt        =   bcrypt.genSaltSync(10);
var passhash    =   bcrypt.hashSync(password, salt);
var masterkey   =   bcrypt.hashSync(bcrypt.genSaltSync(10)+passhash, salt);

cipher.update(new Buffer(masterkey));
var mkeyenc     =   cipher.final('base64');

console.log("Your password:         "+password);
console.log("Your AES Key :         "+AESKEY);
console.log("Your salt:             "+salt);
console.log("Your password hash:    "+passhash);
console.log("Your master key:       "+masterkey);
console.log("Your master key AES:   "+mkeyenc);
