const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

//  authController.protect just for logged in users
// router.post('/submit-password', authController.passwordReset);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.changePassword
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.post('/forgotPassword', authController.forgotPassword);
router.post('/submitPassword/:token', authController.submitPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.get('/appData', authController.protect, userController.getAppData);
// get users not needed, maybe later
// // // router
// // //   .route('/')
// // //   .get(
// // //     authController.protect,
// // //     authController.restrictTo('admin'),
// // //     userController.getAllUsers
// // //   )
// // //   .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
