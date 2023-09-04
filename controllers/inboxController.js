const User = require('../models/User');
const Property = require('../models/Property');

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

const viewAll = async (req, res, next) => {
    const curUser = await getCurUser(req);
    try {
        curUser.inboxSize = curUser.inbox.length ;
        curUser.save(); 
        res.state(200).json({messages: curUser.inbox,
                            adminInbox: curUser.isAdmin,
                            message: 'Fetched inbox successfully',
                            email: curUser.email});
    } catch (error) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const approveProperty = async (req, res, next) => {
    const curUser = await getCurUser(req);
    const propertyId = req.params.propertyId;
    try {
        if (!curUser.isAdmin) res.status(403).json({message: 'You are not allowed to do this action',email: curUser.email});
        else {
            const property = await Property.findById(propertyId);
            if (!property) res.status(409).json({message: 'This property is no longer available in the system',email: curUser.email});
            else {
                property.approvedByAdmin = true;
                await property.save();
                const approvalMessage = {
                    type: 'approval',
                    propertyId: property._id,
                    state: true
                };
                await User.findOneAndUpdate(
                    { _id: property.ownerId},
                    { $push: { inbox: approvalMessage } }
                );
                res.status(200).json({message: "success !",email: curUser.email});
            }
        }
    } catch (error) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const denyProperty = async (req, res, next) => {
    const curUser = await getCurUser(req);
    const propertyId = req.params.propertyId;
    const property = await Property.findById(propertyId);
    try {
        if (!curUser.isAdmin || property.approvedByAdmin) res.status(403).json({message: 'You are not allowed to do this action',email: curUser.email});
        else {
            if (!property) res.status(409).json({message: 'This property is no longer available in the system',email: curUser.email});
            else {
                await property.save();
                const approvalMessage = {
                    type: 'approval',
                    propertyId: property._id,
                    state: false
                };
                await User.findOneAndUpdate(
                    { _id: property.ownerId},
                    { $push: { inbox: approvalMessage } }
                );
                res.status(200).json({message: "success !",email: curUser.email});
            }
        }
    } catch (error) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const acceptPromotionToAdmin = async (req, res, next) => {
    const curUser = await getCurUser(req);
    const userId = req.params.userId;
    try {
        if (!curUser.isAdmin) res.status(403).json({message: 'You are not allowed to do this action',email: curUser.email});
        else {
            const user = await User.findById(userId);
            if (!user) res.status(404).json({message: 'There is no such user in the system',email: curUser.email});
            else {
                const promotionMessage = {
                    type: 'promotion',
                    state: true
                };
                user.inbox.push(promotionMessage);
                user.isAdmin = true;
                await user.save();
                res.status(200).json({message: "success !",email: curUser.email});
            }
        }
    } catch (error) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const rejectPromotionToAdmin = async (req, res, next) => {
    const curUser = await getCurUser(req);
    const userId = req.params.userId;
    const user = await User.findById(userId);
    try {
        if (!curUser.isAdmin || user.isAdmin) res.status(403).json({message: 'You are not allowed to do this action',email: curUser.email});
        else {
            if (!user) res.status(404).json({message: 'There is no such user in the system',email: curUser.email});
            else {
                const promotionMessage = {
                    type: 'promotion',
                    state: false
                };
                user.inbox.push(promotionMessage);
                await user.save();
                res.status(200).json({message: "success !",email: curUser.email});
            }
        }
    } catch (error) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

module.exports = {
    viewAll,
    approveProperty,
    denyProperty,
    acceptPromotionToAdmin,
    rejectPromotionToAdmin
}