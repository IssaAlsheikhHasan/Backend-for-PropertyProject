const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Comment = require('../models/Comment');
const Property = require('../models/Property');
const { validationResult } = require('express-validator');
require('dotenv').config();
const getUserId = async (req) => {
  const authHeader = await req.get('Authorization');
  let id = null;
  if (!authHeader) return id; 
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return id;
  }
  if (!decodedToken) return id;
  req.owenerId = decodedToken.owenerId;
  next();
};

const getCurUser = async (req) => {
  let curUser;
  const id = req.userId;
  try {
    curUser = await User.findById(id);
  }
  catch (err){
    curUser = null;
  }
  return curUser;
}

const checkInbox = async (curUser) => {
  if (curUser) return (curUser.inbox.length > curUser.inboxSize);
  else return false;
}

const clearImages = async (filePaths) => {
  for (let filePath of filePaths) {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Deleted file: ${filePath}`);
      }
    });
  }
};

const getAllProperties = async (req, res, next) => {
  req.userId = getUserId(req);
  const curUser = await getCurUser(req);
  try{
    const properties = await Property.find({approvedByAdmin : true});
    if (properties.length ===0) return res.status(200).json({message:'There are no properties'})
    else return res.status(200).json({properties:properties,
                                      message:"Fetched properties successfully.",
                                      activeInbox: await checkInbox(curUser),
                                      email : curUser.email});
  }
  catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  };
};

const viewProperty = async (req, res, next) => {
  const curUser = await getCurUser(req);
  const propertyId = req.params.propertyId;
  try {
    const property = await Property.findById(propertyId);
    if (property) {
      if (property.approvedByAdmin || curUser.isAdmin || curUser._id.equals(property.ownerId)) {
        res.state(200).json({property,
                            message: 'Fetched property successfully',
                            activeInbox: await checkInbox(curUser),
                            email: curUser.email});
      }
      else res.status(403).json({message: 'You are not allowed to view this property'});
    }
    else res.status(404).json({message: 'Property not found'});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

const createProperty = async (req, res, next) => {
  const userId = req.userId;
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
    const error = new Error('the entered data is incorrect');
    error.status = 422;
    throw error;
  }
  if (!req.files || req.files.length === 0) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrls = req.files.map(file => file.path.replace("\\", "/"));
  let images = [];
  for (let imageUrl of imageUrls) {
    images.push(imageUrl);
  }
  req.body.imageUrl = images;
  req.body.ownerId = userId;
  try{
    const property = await Property.create(req.body);
    const curUser = await findOneAndUpdate(
      { _id: userId},
      { $push: { properties: property._id } },
      { new: true }
    );
    if (curUser.isAdmin) {
      property.approvedByAdmin = true;
      await property.save();
    }
    else{
      const approvalMessage = {
        type: 'approval',
        propertyId: property._id
      };
      await User.updateMany(
        { isAdmin: true },
        { $push: { inbox: approvalMessage } }
      );
    }
    res.status(201).json({
      message: 'created!!',
      property,
      activeInbox: await checkInbox(curUser),
      email : curUser.email
    });
  }
  catch (error){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

const updateProperty = async (req, res, next) => {
  const curUser = await getCurUser(req);
  const propertyId = req.params.propertyId;
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
    const error = new Error('the entered data is incorrect');
    error.status = 422;
    throw error;
  }
  if (!req.files || req.files.length === 0) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrls = req.files.map(file => file.path.replace("\\", "/"));
  let images = [];
  for (let imageUrl of imageUrls) {
    images.push(imageUrl);
  }
  req.body.imageUrl = images;
  req.body.ownerId = userId;
  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      const error = new Error('Could not find such property.');
      error.statusCode = 404;
      throw error;
    }
    if (curUser._id.equals(property.ownerId)) {
      const error = new Error('You are not allowed to do this action.');
      error.statusCode = 403;
      throw error;
    }
    if (property.imageUrl !== images) await clearImages(property.imageUrl);
    property.set(req.body);
    property.approvedByAdmin = curUser.isAdmin;
    if (!curUser.isAdmin) {
      const approvalMessage = {
        type: 'approval',
        propertyId: property._id
      };
      await User.updateMany(
        { isAdmin: true },
        { $push: { inbox: approvalMessage } }
      );
    }
    await property.save();
    res.status(200).json({ message: 'Property updated!',
                          property,
                          activeInbox: await checkInbox(curUser),
                          email : curUser.email });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  };
}

const deleteProperty = async (req, res, next) => {
  const propertyId = req.params.propertyId;
  const curUser = await getCurUser(req);
  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      const error = new Error('Could not find such property.');
      error.statusCode = 404;
      throw error;
    }
    if (curUser._id.equals(property.ownerId)) {
      const error = new Error('You are not allowed to do this action.');
      error.statusCode = 403;
      throw error;
    }
    await clearImages(property.imageUrl);
    await Property.findByIdAndRemove(propertyId);
    await curUser.properties.pull(propertyId);
    await owener.save();

    res.status(200).json({ message: 'Deleted post.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const myProperties = async (req, res, next) => {
  try {
    const curUser = await getCurUser(req);
    res.status(200).json({properties: curUser.properties,
                          activeInbox: await checkInbox(curUser),
                          email : curUser.email});

  } catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const addComment = async (req, res, next) => {
  const propertyId = req.params.propertyId;
  const curUser = await getCurUser(req);
  try{
    const {text, rate} = req.body;
    const comment = await Comment.create({
      text: text,
      ownerId: curUser._id,
      propertyId: propertyId,
      propertyRate: rate
    });
    const property = await Property.findByIdAndUpdate(
      propertyId,
      { $push: { comments: comment._id } },
      { new: true }
    );
    curUser.comments.push(comment._id);
    await curUser.save();
    res.status(200).json({message: 'Sucsess!',
                          property,
                          activeInbox: await checkInbox(curUser),
                          email : curUser.email });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const viewPropertyComments = async (req, res, next) => {
  const propertyId = req.params.propertyId;
  const curUser = await getCurUser(req);
  try {
    const property = await Property.findById(propertyId);
    const propertyComments = property.comments;
    //sorting comments so that the user comments come first then the rest
    const sortedCommentsId = [...curUser.comments, ...propertyComments].sort((a, b) => {
      const aIsUserComment = curUser.comments.includes(a._id.toString());
      const bIsUserComment = curUser.comments.includes(b._id.toString());
      if (aIsUserComment && !bIsUserComment) return -1;
      else if (!aIsUserComment && bIsUserComment) return 1; 
      return 0; 
    });
    const sortedComments = await Comment.aggregate([
      { $match: { _id: { $in: sortedCommentsId } } },
      {
        $addFields: {
          commentOrder: {
            $indexOfArray: [sortedCommentsId, '$_id']
          }
        }
      },
      { $sort: { commentOrder: 1 } }
    ]);
    res.status(200).json({sortedComments,
      message: 'Fetched comments successfully',
      activeInbox: await checkInbox(curUser),
      email: curUser.email});
  } catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

module.exports = {
  getAllProperties,
  viewProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  myProperties,
  addComment,
  viewPropertyComments,
};