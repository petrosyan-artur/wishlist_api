var mongoose     = require('mongoose');
var Schema       = mongoose.Schema,
    ObjectId = Schema.ObjectId;

// wish schema
var WishSchema = new Schema({
	    content: { type: String, required: true, index: true },
	    createdDate: { type: String, required: true, select: true},
        userId: { type: ObjectId, required: true, select: true },
        username: { type: String, required: true, select: true },
        likes: { type: Number, required: true, select: true, default: 0 },
        isActive: { type: Boolean, required: true, select: true, default: true }
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('Wish', WishSchema);