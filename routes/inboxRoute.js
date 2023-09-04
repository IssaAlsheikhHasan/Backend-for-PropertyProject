const express = require('express');
const isAuth = require('../middleware/is-auth');
const inboxController = require('../controllers/inboxController');
const inboxRouter = express.Router();

inboxRouter.get('/view',isAuth, inboxController.viewAll);
inboxRouter.post('/approve-property/:propertyId', isAuth, inboxController.approveProperty);
inboxRouter.post('/deny-property/:propertyId', isAuth, inboxController.denyProperty);
inboxRouter.post('/accept-promotionToAdmin/:propertyId', isAuth, inboxController.acceptPromotionToAdmin);
inboxRouter.post('/reject-promotionToAdmin/:propertyId', isAuth, inboxController.rejectPromotionToAdmin);

module.exports = inboxRouter;