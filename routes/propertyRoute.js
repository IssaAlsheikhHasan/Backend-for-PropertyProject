const express = require('express');
const propertyController = require('../controllers/propertyController');
const isAuth = require('../middleware/is-auth');
const propertyRouter = express.Router();

propertyRouter.get('/all', propertyController.getAllProperties);
propertyRouter.get('/view/:propertyId', isAuth, propertyController.viewProperty);
propertyRouter.post('/new-property', isAuth, propertyController.createProperty);
propertyRouter.put('/edit/:propertyId', isAuth, propertyController.updateProperty);
propertyRouter.delete('/delete/:propertyId', isAuth, propertyController.deleteProperty);
propertyRouter.get('/myProperties', isAuth, propertyController.myProperties);
propertyRouter.post('/:propertyId/add-comment', isAuth, propertyController.addComment);
propertyRouter.get('/:propertyId/comments', isAuth, propertyController.viewPropertyComments);

module.exports = propertyRouter;