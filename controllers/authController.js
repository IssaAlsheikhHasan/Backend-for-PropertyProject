const User = require('../models/User');
const Token = require('../models/Token');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email/sendEmail');
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
require('dotenv').config();

const createToken = (email,userId) => {
    let session = '1h';
    return jwt.sign({email, userId}, process.env.JWT_SECRET,
         {expiresIn : session
      });
};

const handleErrors = (err) => {
    let errors = {email : "", password : "", phoneNumber : ""};
    //validation failed
    if (err.message.includes("validation failed")){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    //Email already exist
    else if (err.code === 11000){
      if (err.message.includes('phone')) {
        errors.phoneNumber =  "This phone number is already exist";
      }
      if (err.message.includes('email')) {
        errors.email =  "This email is already exist";
      }
    }
    else return err;
    return errors;
}

const signup = async (req, res, next) => {
  try{
    const {email, phoneNumber, password, name} = await req.body;
    let newUser = await User.create({email, phoneNumber, password, name});
    const token = createToken(newUser.email, newUser._id);
    res.status(201).json({token, message: 'User created !', id : newUser._id});
  }
  catch(error){
      error = handleErrors(error);
      res.status(500).json({error});
  }
};

const login = async (req, res, next)  => {
try{
  const {phoneNumber, password} = req.body;
  let login = await User.login(phoneNumber, password);
  //console.log(login);
  if (login.phoneNumberError != "") res.status(500).json({phoneNumberError : login.phoneNumberError});
  else if (login.passwordError != "") res.status(500).json({passwordError : login.passwordError});
  else {
      const token = createToken(login.user.phoneNumber, login.user._id);
      res.status(201).json({token, id : login.user._id, message : "Success !"});
  }
}
catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

const sendCode = async (req, res, next) => {
  const email = req.body.email;
  try {
    let user = await User.findOne({email : email});
    if (user){
      let token = await Token.findOne({ userId: user._id });
      if (token) await token.deleteOne();
      let resetToken = crypto.randomBytes(32).toString("hex");
    
      await new Token({
        userId: user._id,
        token: resetToken,
        createdAt: Date.now(),
      }).save();
      await sendEmail(user.email,user.name,resetToken);
      res.status(201).json({message : "Email sent !", userId : user.id});
    }
    else {
      res.status(404).json({message : "There is no account attached to this email !"});
    }
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}
const verifyCode = async (req, res, next) => {
  const {userId, token, newPassword} = req.body;
  try {
    let passwordResetToken = await Token.findOne({ userId });
    let user = await User.findById(userId);
    if (!passwordResetToken || !user) {
      res.status(500).json({message : "Invalid or expired password reset token"});
    }
    else {
      const isValid = await bcrypt.compare(token, passwordResetToken.token);
      if (!isValid) {
        res.status(500).json({message : "Invalid or expired password reset token"});
      }
      else if (newPassword.toString().length<10){
        res.status(500).json({message : "password should be no less than 6 charachter"});
      }
      else{
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(newPassword, salt);
        await User.updateOne(
          { _id: userId },
          { $set: { password: hash}},
          {new : true}
        );
        res.status(201).json({message : "done!"});
      }
    }
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}
module.exports = {
  login,
  signup,
  sendCode,
  verifyCode
}