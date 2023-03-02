const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require('validator');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');

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
    select: false,
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
  passwordChangedAt: Date,
  settings: { type: String, ref: 'Settings' },
  recipeList: [{ type: Array, ref: 'Recipe' }],
  shoppingList: [{ type: Array, ref: 'ShoppingList' }],
  weeklyPlan: [{ type: Array, ref: 'WeeklyPlan' }],
  superUser: { type: Boolean, default: false }
});

userSchema.pre('save', async function(next) {
  // only run if password changed
  if (!this.isModified('password')) return next();
  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // delete passwordConfirm, just needed for password comparison
  this.passwordConfirm = undefined;
  next();
});

// instant method
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = async function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
};
const Users = mongoose.model('User', userSchema);

module.exports = Users;
