const { Mongoose } = require('mongoose');
const Recipes = require('../models/recipeModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const User = require('../models/userModel');

// example list
exports.getExampleRecipes = catchAsync(async (req, res, next) => {
  const query = { ...req.query };
  const recipes = await Recipes.find(query);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: recipes.length,
    data: {
      recipes
    }
  });
});

// exports.getRecipe = catchAsync(async (req, res, next) => {
//   console.log(req.params);
//   const recipe = await Recipes.findById(req.params.id);
//   if (!recipe) {
//     console.log('💥💥💥');
//     return next(new AppError('Recipe not found', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       recipe
//     }
//   });
// });
//==================================================================
// eslint-disable-next-line node/no-unsupported-features/es-syntax
exports.createRecipe = catchAsync(async (req, res, next) => {
  const newRecipe = req.body;
  await User.findByIdAndUpdate(req.user.id, {
    $push: { 'appData.recipeList': newRecipe }
  });
  // const user = await User.findById(req.user.id);
  // console.log('✅', user);
  res.status(201).json({
    status: 'success',
    data: {
      recipe: newRecipe
    }
  });
});

//==================================================================
//BUG
exports.updateRecipe = catchAsync(async (req, res, next) => {
  const searchId = req.params.id;
  const updateRecipe = req.body;
  const user = await User.findById(req.user.id);
  await user.updateOne(
    { 'appData.recipeList': { $elemMatch: { id: searchId } } },
    {
      $set: { 'appData.recipeList.$.name': 'XXXX' }
    }
  );
  // // // await user.updateOne(
  // // //   { 'appData.recipeList': { $elemMatch: { id: searchId } } },
  // // //   {
  // // //     name: 'XXX'
  // // //   }
  // // // );
  console.log(user.appData.recipeList);
  res.status(201).json({
    status: 'success',
    data: {
      recipe: updateRecipe
    }
  });
});
// exports.updateRecipe = catchAsync(async (req, res, next) => {
//   const recipe = await Recipes.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });
//   res.status(200).json({
//     status: 'success',
//     data: {
//       recipe
//     }
//   });
// });

exports.deleteRecipe = catchAsync(async (req, res, next) => {
  // await Recipes.deleteOne({ _id: req.params.id });
  await Recipes.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});
