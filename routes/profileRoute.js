const express = require('express');
const profileController = require('../controllers/profileController');
const isAuth = require('../middleware/is-auth');
const profileRouter = express.Router();

profileRouter.post('/request-promotionToAdmin', isAuth, profileController.promotionToAdminRequest);
profileRouter.get('/:userId', isAuth, profileController.viewProfile);

module.exports = profileRouter;
//add Property of specific user