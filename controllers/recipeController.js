const { Mongoose } = require('mongoose');
const Recipes = require('../models/recipeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
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

// // // exports.getRecipe = catchAsync(async (req, res, next) => {
// // //   console.log(req.params);
// // //   const recipe = await Recipes.findById(req.params.id);
// // //   if (!recipe) {
// // //     console.log('💥💥💥');
// // //     return next(new AppError('Recipe not found', 404));
// // //   }
// // //   res.status(200).json({
// // //     status: 'success',
// // //     data: {
// // //       recipe
// // //     }
// // //   });
// // // });
//==================================================================
// eslint-disable-next-line node/no-unsupported-features/es-syntax
exports.createRecipe = catchAsync(async (req, res, next) => {
  const newRecipe = req.body;
  await User.findByIdAndUpdate(req.user.id, {
    $push: { 'appData.recipeList': newRecipe }
  });
  res.status(201).json({
    status: 'success',
    data: {
      recipe: newRecipe
    }
  });
});

//==================================================================
exports.updateRecipe = catchAsync(async (req, res, next) => {
  const data = await User.findOneAndUpdate(
    { _id: req.user.id, 'appData.recipeList.id': req.params.id },
    {
      $set: {
        'appData.recipeList.$.name': req.body.name,
        'appData.recipeList.$.ingredients': req.body.ingredients,
        'appData.recipeList.$.preparation': req.body.preparation
      }
    },
    { new: true }
  );
  console.log('✅', data);
  if (data === undefined || data === null) {
    return next(new AppError('Document not found', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      recipe: req.body
    }
  });
});

exports.deleteRecipe = catchAsync(async (req, res, next) => {
  // await Recipes.deleteOne({ _id: req.params.id });
  await Recipes.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});
