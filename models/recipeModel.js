const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Bitte Name eingeben!'],
    unique: true
  },
  ingredients: Array,
  preparation: String
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// const testRecipe = new Recipe({
//   name: 'Aus nix irgend was',
//   ingredients: [{ name: 'Zwiebel', quantity: 100, unit: 'g' }],
//   preparation: 'Hier steht die \nZubereitung!'
// });

// testRecipe
//   .save()
//   .then(doc => console.log(doc))
//   .catch(err => console.log(err));

module.exports = Recipe;
