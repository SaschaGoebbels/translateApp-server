const express = require('express');
const recipeController = require('../controllers/recipeController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    recipeController.getAllRecipes
  )
  .post(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    recipeController.createRecipe
  );
router
  .route('/:id')
  .get(authController.protect, recipeController.getRecipe)
  .patch(authController.protect, recipeController.updateRecipe)
  .delete(authController.protect, recipeController.deleteRecipe);

module.exports = router;
