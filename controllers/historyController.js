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
