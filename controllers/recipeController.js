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
// eslint-disable-next-line node/no-unsupported-features/es-syntax
exports.createRecipe = catchAsync(async (req, res, next) => {
  const newRecipe = req.body;
  const user = await User.findById(req.user.id);
  await User.findByIdAndUpdate(req.user.id, {
    $push: { 'appData.recipeList': newRecipe }
  });
  console.log(user.testList.length);
  // await user.save();
  // await User.updateOne(
  //   { _id: req.user.id },
  //   {
  //     $push: { testList: newRecipe }
  //   }
  // );
  // // await User.updateOne(
  // //   { _id: req.user.id },
  // //   {
  // //     $push: { 'appData.recipeList': newRecipe }
  // //   }
  // // );
  res.status(201).json({
    status: 'success',
    data: {
      recipe: newRecipe
    }
  });
});

exports.updateRecipe = catchAsync(async (req, res, next) => {
  const updateRecipe = req.body.updated;
  console.log(updateRecipe);
  await User.updateOne(
    { _id: req.user.id },
    {
      $set: {
        'recipeList.$[element]': updateRecipe
      }
    },
    {
      arrayFilters: [
        {
          'element.name': req.body.name
        }
      ]
    }
  );
  // await User.updateOne(
  //   { _id: req.user.id },
  //   {
  //     $push: { 'appData.recipeList': updateRecipe }
  //   }
  // );
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
