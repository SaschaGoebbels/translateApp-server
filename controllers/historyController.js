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

exports.deleteHistoryList = catchAsync(async (req, res) => {
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
exports.postRecipe = catchAsync(async (req, res) => {
  let mongooseUpdate = {
    $push: {
      'appData.recipeList': req.body.recipe
    }
  };
  if (req.params.list === 'shoppingList') {
    mongooseUpdate = {
      $push: {
        'appData.shoppingList': req.body.recipe
      }
    };
  }
  if (req.params.list === 'weeklyPlan') {
    mongooseUpdate = {
      $push: {
        'appData.weeklyPlan': req.body.recipe
      }
    };
  }
  await User.findByIdAndUpdate(req.user.id, mongooseUpdate, {
    new: true,
    upsert: true
  });
  res.status(200).json({ status: 'success' });
});

exports.updateHistoryList = catchAsync(async (req, res) => {
  console.log('✅', req.body.recipe);
  const user = await User.findById(req.user.id);
  const index = user.appData.recipeList
    .map(e => e.id)
    .indexOf(req.body.recipe.id);
  user.appData.recipeList.splice(index, 1, req.body.recipe);
  await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        'appData.recipeList': user.appData.recipeList
      }
    },
    {
      new: true,
      upsert: true
    }
  );
  res.status(200).json({ status: 'success', data: user.appData });
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
