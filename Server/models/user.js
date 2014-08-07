var mongoose      = require('mongoose');
var uuid          = require('node-uuid');
var bcrypt        = require('bcryptjs');

exports.Schemas = function(mg) {
  var Schema        = mg.Schema;
  var userSchema = new Schema({
    uuid      :   { type: String, unique: true }, 
    username  :   { type: String, index: true },
    password  :   String,
    name      :   String
  });
  userSchema.methods.GenUUID          = function()  {  this.uuid = uuid.v1();  };
  userSchema.methods.ComparePassword  = function(password)  {
    return bcrypt.compareSync(password, this.password);
  }
  userSchema.methods.SetPassword      = function(password)  {
    this.password = bcrypt.hashSync(password,  8);
  }
  return {"userSchema":userSchema};;
}

