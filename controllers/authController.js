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
const sendLoginToken = async (user, statusCode, res, req) => {
  const token = signToken(user._id);
  res.setHeader(
    'Set-Cookie',
    `ksJwt=${token}; Secure; SameSite=None;Path=/;Max-Age=${60 * 60 * 24 * 90}`
  );

  // // // remove password & role from output
  user.password = undefined;
  user.role = undefined;
  user.active = undefined;
  user.createdAt = undefined;
  user.updatedAt = undefined;
  res.status(statusCode).json({
    status: 'success',
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  res.status(200).json({ status: 'success' });
});

const demoUserRecipeList = async user => {
  const recipes = await Recipes.find();
  user.appData.recipeList = recipes;
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // if no email or password is provided, return an error
  if (!email || !password) {
    return next(new AppError('Bitte Email und Passwort angeben !', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  // // if no user or incorrect password, return an error
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(
        'Die Daten sind nicht korrekt bitte prüfen Sie Ihre Eingabe !',
        401
      )
    );
  }
  if (user.role === 'demo') {
    await demoUserRecipeList(user);
  }
  sendLoginToken(user, 200, res, req);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.setHeader(
    'Set-Cookie',
    `ksJwt=${null}; Secure; SameSite=None;Path=/;Max-Age=${1}`
  );
  res.status(200).json({ status: 'logout', token: null });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  let cookies;
  if (req.headers.cookie) {
    cookies = req.headers.cookie.split(' ');
    cookies.forEach(el => {
      if (el.startsWith('ksJwt')) {
        token = el.split('=')[1].replace(';', '');
      }
    });
  }
  if (!token) {
    return next(
      new AppError(
        'Sie müssen sich einloggen um diese Action auszuführen !',
        401
      )
    );
  }
  // validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('Es wurde kein Benutzerkonto gefunden !', 401));
  }
  // check if password is changed after the token
  if (await currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('Der Benutzer hat das Passwort kürzlich geändert !', 401)
    );
  }
  // access to protected route
  // if demo return recipeList
  ////////////////// TODO ////////////////// if demo res with req
  if (currentUser.role === 'demo') {
    console.log('🏆🏆🏆', currentUser);
    await demoUserRecipeList(currentUser);
    console.log('❌');
    // // // res.status(200).json({
    // // //   status: 'success'
    // // // });
    // // // return;
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log('restricted', !roles.includes(req.user.role));
      // error doubled because otherwise no output
      next(
        new AppError('Sie haben keine Berechtigung für diese Action !', 403)
      );
      return next(
        new AppError('Sie haben keine Berechtigung für diese Action !', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user by provided email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('Zu dieser Emailadresse gibt es kein Benutzerkonto !', 404)
    );
  }
  // generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // send token via mail
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/submitPassword/?token=${resetToken}`;
  const message =
    'Bitte klicken Sie auf den Link um ein neues Passwort für Ihren Account zu vergeben. \n\nWenn Sie diese Email nicht angefordert haben, ignorieren Sie diese Nachricht !';
  try {
    await sendEmail({
      email: user.email,
      subject:
        'Kochstudio - Password zurücksetzen (Link gültig für 10 minuten)',
      text: `${message} \n \n ${resetUrl}`
    });
    res.status(200).json({
      status: 'success',
      message: 'Es wurde ein Reset-Token an die Emailadresse gesendet.'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Die Email konnte nicht gesendet werden !', 500));
  }
});

// render page to reset password
exports.submitPassword = catchAsync(async (req, res, next) => {
  res.status(200).render('submitPassword', {
    data: JSON.stringify({
      token: req.query.token
    })
  });
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
      new AppError(
        'Der Password-Reset-Token ist ungültig oder abgelaufen !',
        400
      )
    );
  }
  // update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.status(200).json({ status: 'success' });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  // get user use select('+password') to output the password and compare it with the provided password
  const user = await User.findById(req.user.id).select('+password');

  // check posted password -> instant method on user model to compare the bcryptjs password
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Das Password ist falsch !', 401));
  }
  // update password -> validation is outsourced to user model
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  // user.save = async function !!!
  await user.save();
  // login with new password
  sendLoginToken(user, 200, res);
});
