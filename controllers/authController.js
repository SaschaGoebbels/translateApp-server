/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');

const { promisify } = require('util');
const AppError = require('../utils/appError');

const User = require('./../models/userModel');
// const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  const token = signToken(newUser._id);

  res.status(201).json({ status: 'success', token, user: newUser });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // if no email or password is provided, return an error
  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  // // if no user or incorrect password, return an error
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);
  res.status(200).json({ status: 'success', token });
});

exports.protect = catchAsync(async (req, res, next) => {
  // get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You need to be logged in to perform this action', 401)
    );
  }
  // validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User not found', 401));
  }
  // check if password is changed after the token
  if (await currentUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password', 401));
  }
  // access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user by provided email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email', 404));
  }
  ////////////////// TODO //////////////////
  // generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // send token via mail
  // const resetUrl = `${req.protocol}://${req.get(
  //   'host'
  // )}/api/v1/users/resetPassword/${resetToken}`;
  const message =
    'If you did not forgot your password, please ignore this email !';
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token (Valid for 10 minutes)',
      message
      // resetUrl
    });
    res.status(200).json({ status: 'success', message: 'Token sent to email' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Email could not be sent', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {});
