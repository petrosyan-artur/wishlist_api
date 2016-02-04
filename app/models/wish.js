var mongoose     = require('mongoose');
var Schema       = mongoose.Schema,
    ObjectId = Schema.ObjectId;

// wish schema
var WishSchema = new Schema({
	    content: { type: String, required: true, index: true },
	    createdDate: { type: String, required: true, select: true},
        timestamp: { type: Number, required: true, select: true, default: Math.round(+new Date()/1000) },
        userId: { type: ObjectId, required: true, select: true },
        username: { type: String, required: true, select: true },
        likes: { type: Number, required: true, select: true, default: 0 },
        decoration: {type: Object, required: true, select: true },
        isActive: { type: Boolean, required: true, select: true, default: true }
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('Wish', WishSchema);