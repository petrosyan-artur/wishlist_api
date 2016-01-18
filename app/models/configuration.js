var mongoose     = require('mongoose');
var Schema       = mongoose.Schema,
    ObjectId = Schema.ObjectId;

// configuration schema
var ConfigurationSchema = new Schema({
	    configs: { type: Object, required: true, select: true}
    }
);

module.exports = mongoose.model('Configuration', ConfigurationSchema);