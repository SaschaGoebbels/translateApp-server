const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filteredObj = (body, ...allowedFields) => {
  const newObj = {};
  Object.keys(body).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = body[el];
  });
  return newObj;
};

// on app start check token, send back userData
exports.getAppData = catchAsync(async (req, res) => {
  // console.log('UserController', req.user.appData);

  req.user.role = undefined;
  res.status(200).json({ user: req.user });
});

// upload all app data // used for exampleList
exports.postAppData = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { appData: req.body.appData });
  req.user.role = undefined;
  res.status(200).json({ status: 'success' });
});

////////////////// TODO ////////////////// ///////////////// BOOKMARK ///////////////// B
// upload all app data // used for exampleList
exports.postUpdateAppData = catchAsync(async (req, res) => {
  const { settings } = req.body.settings;
  console.log('❌', settings);
  // await User.findByIdAndUpdate(req.user.id, { appData });
  await User.findByIdAndUpdate(req.user.id, {
    appData: { settings: settings }
  });
  req.user.role = undefined;
  res.status(200).json({ status: 'success' });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // error if post passwordData
  console.log(req.body);
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for updating Password !', 400));
  }
  // update userData -> for safety reasons filter body to only update following data
  const filteredBody = filteredObj(
    req.body,
    'name',
    'email',
    'phone',
    'address'
  );
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'success', data: null });
});

// // exports.getUser = (req, res) => {DELETE
// //   res.status(500).json({
// //     status: 'error',
// //     message: 'This route is not yet defined!'
// //   });
// // };

// // exports.updateUser = (req, res) => {
// //   res.status(500).json({
// //     status: 'error',
// //     message: 'This route is not yet defined!'
// //   });
// // };
// // exports.deleteUser = (req, res) => {
// //   res.status(500).json({
// //     status: 'error',
// //     message: 'This route is not yet defined!'
// //   });
// // };
