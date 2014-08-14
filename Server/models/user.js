var mongoose      = require('mongoose');
var uuid          = require('node-uuid');
var bcrypt        = require('bcryptjs');
var crypto        = require('crypto');

function sha(data)          { return crypto.createHash('sha1').digest("hex");   };

exports.Schemas = function(mg) {
  var Schema        = mg.Schema;
  var userSchema = new Schema({
    uuid      :   { type: String, unique: true }, 
    username  :   { type: String, index: true },
    password  :   String,
    name      :   String,
    level     :   Number 
  });
  userSchema.methods.GenUUID          = function()  {  this.uuid = uuid.v1();  };
  userSchema.methods.ComparePassword  = function(password)  {
    return bcrypt.compareSync(password, this.password);
  }
  userSchema.methods.SetPassword      = function(password)  {
    this.password = bcrypt.hashSync(password,  8);
  }

  var sessionSchema = new Schema({
    sessionkey  : String,
    useruuid    : { type: String, index: true},
    startdate   : Number,
    maxdays     : Number,
    level       : Number
  });

  sessionSchema.methods.GenKey      = function()  {    this.sessionkey = uuid.v1();  };
  sessionSchema.methods.IsValid     = function()  {   
      return (this.maxdays == -1) || ( this.startdate + (this.maxdays * 24 * 60 * 60 * 1000) > Date.now());
  };
  sessionSchema.methods.UpdateDate  = function()  {
    this.startdate = Date.now();
    this.save();
  };
  sessionSchema.methods.GetUser     = function(cb)  { return this.model("Users").find({"uuid":this.useruuid}, cb)};
  return {"userSchema":userSchema,"sessionSchema":sessionSchema};
}

