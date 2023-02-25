const Recipes = require('../models/recipeModel');

exports.getAllRecipes = async (req, res) => {
  try {
    const query = { ...req.query };
    const recipes = await Recipes.find(query);
    console.log(query);
    console.log(req.query);
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: recipes.length,
      data: {
        recipes
      }
    });
  } catch (err) {
    res.status(404).json({ status: 'not found', message: err });
  }
};

exports.getRecipe = async (req, res) => {
  console.log(req.params);
  try {
    // const recipe = await Recipes.find(el => el.id === id);
    const recipe = await Recipes.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        recipe
      }
    });
  } catch (err) {
    res.status(404).json({ status: 'not found', message: err });
  }
};
// eslint-disable-next-line node/no-unsupported-features/es-syntax
exports.createRecipe = async (req, res) => {
  try {
    const newRecipe = await Recipes.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        recipe: newRecipe
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({ status: 'not found', message: err });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    // await Recipes.deleteOne({ _id: req.params.id });
    await Recipes.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({ status: 'not found', message: err });
  }
};
