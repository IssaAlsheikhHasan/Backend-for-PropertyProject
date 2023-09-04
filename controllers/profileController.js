const User = require('../models/User');

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
};

const checkInbox = async (curUser) => {
    if (curUser) return (curUser.inbox.length > curUser.inboxSize);
    else return false;
};

const promotionToAdminRequest = async (req, res, next) => {
    const curUser = await getCurUser(req);
    try {
      if (curUser.isAdmin) {
        res.status(409).json({message: 'You have already promoted to admin!'});
      }
      else {
        const promotionMessage = {
          type: 'promotion',
          userId: curUser._id
        };
        await User.updateMany(
          { isAdmin: true },
          { $push: { inbox: promotionMessage } }
        );
        res.status(201).json({message: 'success !'});
      }
    } catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

const viewProfile = async (req, res, next) => {
    const userId = req.params.userId;
    const curUser = await getCurUser(req);
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({message: 'No such user exist in the server !', 
                                activeInbox: await checkInbox(curUser),
                                email : curUser.email});
        }
        else {
            res.status(202).json({message: "success !",
                                phoneNumber: user.phoneNumber,
                                profileEmail: user.email,
                                fullName: user.name,
                                activeInbox: await checkInbox(curUser),
                                email : curUser.email});
        }
      } catch(err){
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
    }
};

module.exports = {
    promotionToAdminRequest,
    viewProfile
};