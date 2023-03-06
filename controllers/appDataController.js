const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.getUserAppData = catchAsync(async (req, res, next) => {
  //getAllRecipes
  const user = await User.findByIdAndUpdate(req.user.id);
  res.status(200).json({
    status: 'success',
    data: user.appData
  });
});
//==================================================================
