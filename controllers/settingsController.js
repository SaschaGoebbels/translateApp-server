const User = require('../models/userModel');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// update settings
exports.postUpdateSettings = catchAsync(async (req, res) => {
  const settings = { ...req.body.settings };
  await User.findByIdAndUpdate(req.user.id, {
    $set: { 'appData.settings': settings }
  });
  //==================================================================
  req.user.role = undefined;
  res.status(200).json({ status: 'success' });
});
