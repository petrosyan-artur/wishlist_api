var mongoose     = require('mongoose');
var Schema       = mongoose.Schema,
    ObjectId = Schema.ObjectId;

// configuration schema
var ConfigurationSchema = new Schema({
	    name: { type: String, required: true, select: true},
        value: { type: String, required: true, select: true}
    }
);

module.exports = mongoose.model('Configuration', ConfigurationSchema);