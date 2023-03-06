const express = require('express');
const appDataController = require('../controllers/appDataController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    appDataController.getUserAppData
  );
//   .post(
//     authController.protect,
//     authController.restrictTo('admin', 'user')
//     appDataController.getUserAppData
//   );

module.exports = router;
