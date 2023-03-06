const Recipes = require('../models/recipeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const { Mongoose } = require('mongoose');

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
////////////////// FIXME ////////////////// recipe issue
// eslint-disable-next-line node/no-unsupported-features/es-syntax
exports.createRecipe = catchAsync(async (req, res, next) => {
  console.log('✅', req.body);
  const newRecipe = await Mongoose.model('recipe', req.body);
  console.log(newRecipe);
  // const newRecipe = await Recipes.create({
  // name: req.body.name
  // ingredients: req.body.ingredients,
  // preparation: req.body.preparation
  // });
  console.log('✅', newRecipe);
  // const user = User.findByIdAndUpdate(req.user.id);
  // console.log(newRecipe);
  // user.appData.recipeList.push(newRecipe);
  // user.save();
  res.status(201).json({
    status: 'success',
    data: {
      recipe: 'newRecipe'
    }
  });
});

exports.updateRecipe = catchAsync(async (req, res, next) => {
  const recipe = await Recipes.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      recipe
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
