const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/deleteHistoryList',
  authController.protect,
  userController.deleteRecipeList
);

module.exports = router;
