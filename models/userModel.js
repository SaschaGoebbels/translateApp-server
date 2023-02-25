const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { required: [true, 'Bitte Name eingeben !'], type: String, trim: true },
  email: {
    required: [true, 'Bitte Email eingeben !'],
    type: String,
    trim: true,
    unique: [true, 'Die Emailadresse ist schon vorhanden !']
  }
  // password: {
  //   required: [true, 'Bitte Passwort eingeben!'],
  //   type: String,
  //   trim: true
  // },
  // passwordConfirm: { required: true, type: String, trim: true },
  // settings: { type: String, ref: 'Settings' },
  // recipeList: [{ type: Array, ref: 'Recipe' }],
  // shoppingList: [{ type: Array, ref: 'ShoppingList' }],
  // weeklyPlan: [{ type: Array, ref: 'WeeklyPlan' }],
  // superUser: { type: Boolean, default: false }
});

exports.Users = mongoose.model('User', userSchema);
