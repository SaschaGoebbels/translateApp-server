const express = require('express');
const historyController = require('../controllers/historyController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/deleteHistoryList',
  authController.protect,
  historyController.deleteHistoryList
);

module.exports = router;
