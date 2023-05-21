const express = require('express');
const authController = require('../controllers/authController');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

router.post(
  '/updateSettings',
  authController.protect,
  settingsController.postUpdateSettings
);

module.exports = router;
