/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');

const { promisify } = require('util');
const AppError = require('../utils/appError');

const User = require('./../models/userModel');
// const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

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
  // generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  // create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  // generate token
  // send token via mail
});
exports.resetPassword = catchAsync(async (req, res, next) => {});
