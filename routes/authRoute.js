const express = require('express');
const authController = require('../controllers/authController');
const isAuth = require('../middleware/is-auth');
const authRouter = express.Router();

authRouter.post('/signup', authController.signup);
authRouter.post('/login', authController.login);
//Apply 'you already have code?' button because each code can be used up to 1 hour from it's create time
authRouter.post('/requestResetCode', authController.sendCode);
//reset password page should have 2 fields verify code and the new password, api should recieve them both with the user id also
authRouter.post('/reset-password', authController.verifyCode);

module.exports = authRouter;