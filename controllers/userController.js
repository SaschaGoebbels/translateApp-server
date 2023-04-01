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

exports.postUpdateSettings = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: { 'appData.settings': { ...req.body } }
    },
    { new: true, upsert: true }
  );
  // ==================================================================
  req.user.role = undefined;
  res.status(200).json({ status: 'success' });
});

exports.deleteRecipeList = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        'appData.recipeList': [],
        'appData.weeklyPlan': [],
        'appData.shoppingList': []
      }
    },
    { new: true, upsert: true }
  );
  console.log('❌', user);
  res.status(200).json({ status: 'success', data: user.appData });
});
///////////////////////////////////////////////////////////////////////
////////////////// TODO ////////////////// ///////////////// BOOKMARK ///////////////// B
exports.postRecipe = catchAsync(async (req, res) => {
  console.log('✅', req.body);
  console.log('✅', req.params);
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      // // $push: {
      // //   'appData.recipeList': req.body
      // //   // 'appData.weeklyPlan': [],
      // //   // 'appData.shoppingList': []
      // // }
    },
    { new: true, upsert: true }
  );
  console.log('❌', user);
  res.status(200).json({ status: 'success', data: user.appData });
});

///////////////// BOOKMARK ///////////////// B
exports.updateRecipe = catchAsync(async (req, res) => {
  const recipeId = req.params.id;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      // $push: {
      //   'appData.recipeList':
      //   // 'appData.weeklyPlan': [],
      //   // 'appData.shoppingList': []
      // }
    },
    { new: true, upsert: true }
  );
  console.log('❌', user);
  res.status(200).json({ status: 'success', data: user.appData });
});

///////////////// BOOKMARK ///////////////// B
exports.deleteRecipe = catchAsync(async (req, res) => {
  const recipeId = req.params.id;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        'appData.recipeList': [],
        'appData.weeklyPlan': [],
        'appData.shoppingList': []
      }
    },
    { new: true, upsert: true }
  );
  console.log('❌', user);
  res.status(200).json({ status: 'success', data: user.appData });
});
///////////////////////////////////////////////////////////////////////////

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
