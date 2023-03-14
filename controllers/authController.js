/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { promisify } = require('util');
const AppError = require('../utils/appError');

const User = require('./../models/userModel');

const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};
//
////////////////// FIXME //////////////////
const sendLoginToken = async (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + 24 * 60 * 60 * 1000 * process.env.JWT_COOKIE_EXPIRES_IN
    ),
    httpOnly: true,
    SameSite: 'none',
    secure: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.cookie('tokenWithOut', token);
  res.setHeader('Set-Cookie', 'myCookie=myValue; Secure; SameSite=None');
  // remove password from output
  user.password = undefined;
  res.status(statusCode).json({ status: 'success', data: { user } });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
    // appData:{recipeList,}
  });
  console.log('✅', newUser);
  sendLoginToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  console.log('🚩', req.cookies);
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
  sendLoginToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', null);
  res.status(200).json({ status: 'logout', token: null });
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
  console.log('🏆 protect: ', req.user.name);
  ////////////////// TODO ////////////////// if demo res with req
  if (req.user.role === 'demo') console.log('❌ DEMO');
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log('restricted', !roles.includes(req.user.role));
      // error doubled because otherwise no output
      next(
        new AppError('You do not have permission to perform this action', 403)
      );
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
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // send token via mail
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message =
    'If you did not forgot your password, please ignore this email !';
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token (Valid for 10 minutes)',
      message,
      text: resetUrl
    });
    res.status(200).json({ status: 'success', message: 'Token sent to email' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Email could not be sent', 500));
  }
});

// decrypt token
const hashedToken = encryptedToken => {
  return crypto
    .createHash('sha256')
    .update(encryptedToken)
    .digest('hex');
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  // first encrypt the token get user by provided token
  const user = await User.findOne({
    passwordResetToken: hashedToken(req.params.token),
    //$gt grater than mongoDb will check
    passwordResetExpires: { $gt: Date.now() }
  });
  // if token expired return error
  if (!user) {
    return next(
      new AppError('Password reset token is invalid or has expired', 400)
    );
  }
  // update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // login and return new jsonwebtoken
  sendLoginToken(user, 200, res);
});

exports.changePassword = catchAsync(async (req, res, next) => {
  // get user use select('+password') to output the password and compare it with the provided password
  const user = await User.findById(req.user.id).select('+password');

  // check posted password -> instant method on user model to compare the bcryptjs password
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Current password is incorrect', 401));
  }
  // update password -> validation is outsourced to user model
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  // user.save = async function !!!
  await user.save();
  // login with new password
  sendLoginToken(user, 200, res);
});
