const express = require('express');
const recipeController = require('../controllers/recipeController');
const authController = require('../controllers/authController');
const appDataController = require('../controllers/appDataController');

const router = express.Router();
router
  .route('/getExampleRecipes')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'user', 'demoUser'),
    recipeController.getExampleRecipes
  );

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    appDataController.getUserAppData
  )
  .post(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    recipeController.createRecipe
  );
router
  .route('/:id')
  // .get(authController.protect, recipeController.getRecipe) //temporarily disable this route
  .patch(authController.protect, recipeController.updateRecipe)
  .delete(authController.protect, recipeController.deleteRecipe);

module.exports = router;
