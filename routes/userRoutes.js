const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

//  authController.protect just for logged in users
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.changePassword
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.post('/forgotPassword', authController.forgotPassword);
router.route('/submitPassword').get(authController.submitPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// app specific routes
router.get('/appData', authController.protect, userController.getAppData);
router.post('/appData', authController.protect, userController.postAppData);
router.post(
  '/updateSettings',
  authController.protect,
  userController.postUpdateSettings
);
router.post(
  '/deleteRecipeList',
  authController.protect,
  userController.deleteRecipeList
);

router
  .route('/recipe/:id/:list/')
  .post(authController.protect, userController.postRecipe);

router.post(
  '/recipeDelete/:id/:list/',
  authController.protect,
  userController.deleteRecipe
);

router.post(
  '/recipeUpdate/:id/:list/',
  authController.protect,
  userController.updateRecipe
);

router.post(
  '/weeklyPlan',
  authController.protect,
  userController.updateWeeklyPlan
);
router.post(
  '/shoppingList',
  authController.protect,
  userController.updateShoppingList
);
router.post('/shopSum', authController.protect, userController.shopSum);

module.exports = router;
