var mongoose     = require('mongoose');
var Schema       = mongoose.Schema,
    ObjectId = Schema.ObjectId;

// rate schema
var RateSchema = new Schema({
	    rate: { type: Number, required: true, default: 1},
        wishId: { type: ObjectId, required: true, select: true },
        userId: { type: ObjectId, required: true, select: true, index: true }
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('Rate', RateSchema);