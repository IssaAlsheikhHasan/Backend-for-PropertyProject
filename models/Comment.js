const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const commentSchema = new Schema({
    text: { 
        type: String,
        required: true 
    },
    propertyId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Property',
        required: true 
    },
    ownerId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    propertyRate: {
        type: Number,
        required: true
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);