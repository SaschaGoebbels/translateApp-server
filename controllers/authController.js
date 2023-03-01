// const mongoose = require('mongoose');
const User = require('./../models/userModel');
// const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  console.log('✅');
  const newUser = await User.create(req.body);
  console.log('✅', newUser);
  try {
    const newUser = await User.create(req.body);
    console.log('✅', newUser);

    res.status(201).json({ status: 'success', user: newUser });
  } catch (error) {
    // console.log('❌CATCH');
    res.status(500).json({ err: error, message: error.message });
  }
});
