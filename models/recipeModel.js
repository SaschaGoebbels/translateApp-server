const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Bitte Name eingeben!'],
    trim: true,
    unique: true
  },
  ingredients: Array,
  preparation: String
});

const Recipes = mongoose.model('Recipe', recipeSchema);

module.exports = Recipes;
