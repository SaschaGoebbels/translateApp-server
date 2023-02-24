const express = require('express');
const recipeController = require('../controllers/recipeController');

const router = express.Router();

// router.param('id', tourController.checkID);
// console.log('😁', recipeController);
// console.log('😁', router);
router
  .route('/')
  .get(recipeController.getAllRecipes)
  .post(recipeController.createRecipe);
router
  .route('/:id')
  .get(recipeController.getRecipe)
  .patch(recipeController.updateRecipe)
  .delete(recipeController.deleteRecipe);

module.exports = router;
