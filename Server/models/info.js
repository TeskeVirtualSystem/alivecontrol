var mongoose      = require('mongoose');
var uuid          = require('node-uuid');


exports.Schemas = function(mg) {
  var Schema        = mg.Schema;

  var TWPSchema    = new Schema({
    uuid      : { type: String, unique: true }, 
    target    : { type: Date, index: true },
    title     : String,
    subtitle  : String,
    level     : Number,
    message   : String,
    from      : { type: String, index: true },
    to        : { type: String, index: true },
    cc        : [String],
    solved    : { type: Boolean, index: true, default: false},
    solvedby  : { type: String, index: true}
  });

  var alertSchema = new Schema({
    id        : { type: String, unique: true },
    when      : { type: Date, default: Date.now, index: true },
    name      : String,
    badge     : String,
    badgelabel: String,
    cc        : [String],
    to        : { type: String, default: "ALL", index: true } 
  });

  TWPSchema.methods.GenUUID         = function()  {  this.uuid = uuid.v1();  };
  alertSchema.methods.GenUUID       = function()  {  this.uuid = uuid.v1();  };

  return {"alertSchema":alertSchema,"TWPSchema":TWPSchema};
}

