const mongoose = require('mongoose');
const Comment = require('./Comment');
const propertyRouter = require('../routes/propertyRoute');
const Schema = mongoose.Schema;

const propertySchema = new Schema(
  {
    approvedByAdmin: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: [{ 
      type: String,
      required: true
    }],
    price: {
      type: Number,
      required: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    state:{
      type: String,
      required: true
    },
    city:{
      type: String,
      required: true
    },
    propertyType:{
      type: String,
      required: true
    },
    numOfBathrooms:{
      type: Number,
      required: true
    },
    livingSpace:{
      type: Number,
      required: true
    },
    floor:{
      type: Number,
      required: true
    },
    latitude:{
      type: Number,
      required: true
    },
    longitude:{
      type: Number,
      required: true
    },
    transactionType:{
      type: String,
      required: true
    },
    rooms:{
      type: Number,
      required: true
    },
    comments: [{ 
      type: Schema.Types.ObjectId,
       ref: 'Comment' 
      }],
    propertyRating: {
      type: Number,
      default: 0
    }
  }
,{ timestamps: true });

propertySchema.pre('save', async function (next){
  if (this.isModified('comments')) {
    let totalRating = 0, commentCount = 0;
    await this.comments.forEach(commentId => {
      // Assuming each comment has a "rating" property
      const comment = Comment.findById(commentId);
      if (comment.propertyRate) {
        totalRating += comment.propertyRate;
        commentCount++;
      }
    });
    if (commentCount) totalRating /= commentCount;
    this.propertyRating = totalRating;
  }
  next();
});

module.exports = mongoose.model('Property', propertySchema);