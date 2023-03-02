// const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const User = require('./../models/userModel');
// const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  // try {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

  res.status(201).json({ status: 'success', token, user: newUser });
  // } catch (error) {
  //   // console.log('❌CATCH');
  //   res.status(500).json({ err: error, message: error.message });
  // }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // //if no email or password is provided, return an error
  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
  res.status(200).json({ status: 'success', token: token });
});
