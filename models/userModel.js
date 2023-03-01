const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: { required: [true, 'Bitte Name eingeben !'], type: String, trim: true },
  email: {
    required: [true, 'Bitte Email eingeben !'],
    type: String,
    trim: true,
    unique: [true, 'Die Emailadresse ist schon vorhanden !'],
    lowercase: true,
    validate: [validator.isEmail, 'Bitte eine gültige Emailadresse eingeben!']
  },
  photo: String,
  password: {
    required: [true, 'Bitte Passwort eingeben!'],
    type: String,
    trim: true,
    minlength: [4, 'Passwort muss mindestens 4 Zeichen lang sein!']
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Bitte Passwort bestätigen!'],
    validation: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwort stimmt nicht überein'
    }
  },
  settings: { type: String, ref: 'Settings' },
  recipeList: [{ type: Array, ref: 'Recipe' }],
  shoppingList: [{ type: Array, ref: 'ShoppingList' }],
  weeklyPlan: [{ type: Array, ref: 'WeeklyPlan' }],
  superUser: { type: Boolean, default: false }
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  //TODO
});
const Users = mongoose.model('User', userSchema);

module.exports = Users;
