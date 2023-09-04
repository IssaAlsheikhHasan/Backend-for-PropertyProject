const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {isEmail} = require('validator');
const phoneValidator = require('../utils/validator/selfValidator');
const bcrypt = require('bcryptjs');
const messageSchema = new Schema({
    type: {
      type: String,
      enum: ['approval', 'promotion'],
      required: true
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property'
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    state: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date,
      default: Date.now
    }
});
const userSchema = new Schema({
    email: {
      type : String,
      unique : [true,"email is in use"],
      required : [true,"email is required"],
      lowercase : true,
      validate : [isEmail,"please Enter a valid email"]
    },
    phoneNumber: {
      type : String,
      unique : [true,"phone number is in use"],
      required : [true,"phone number is required"],
      validate : [phoneValidator,"please Enter a valid syrian phone number"]
    },
    password: {
      type : String,
      required : [true,"password is required"],
      minlength : [6,"password should be no less than 6 charachter"]
    },
    name: {
      type: String,
      lowercase : true,
      required: true
    },
    properties: [{
      type: Schema.Types.ObjectId,
      ref: 'Property'
    }],
    inbox: [messageSchema],
    inboxSize: {
      type: Number,
      default: 0
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]

},{
  timestamps : true
})

userSchema.statics.login = async function(phoneNumber, password){
  const user = await this.findOne({phoneNumber});
  let passwordError = "", phoneNumberError="";
  if (!phoneValidator(phoneNumber)) phoneNumberError = "invalid phone number";
  else if (user){
      const auth = await bcrypt.compare(password, user.password);
      if (!auth) passwordError = "Incorrect password";
  }
  else phoneNumberError = "There is no account attached to this phone number";
  return {
      phoneNumberError,
      passwordError,
      user
  };
}

userSchema.pre("save", async function (next) {
  if (this.isModified('password')){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

module.exports = mongoose.model('user', userSchema);