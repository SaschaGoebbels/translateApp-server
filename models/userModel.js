const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require('validator');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    minlength: [4, 'Das Passwort muss mindestens 4 Zeichen lang sein!']
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  passwordConfirm: {
    type: String,
    required: [true, 'Bitte Passwort bestätigen!'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwort stimmt nicht überein'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: { type: Boolean, default: true, select: false },
  createdAt: { type: Date, default: Date.now, select: false },
  updatedAt: { type: Date, default: Date.now, select: false },
  // // //DELETE this line
  // // test: {
  // //   type: Array,
  // //   default: [
  // //     { name: 'aaa', id: 1 },
  // //     { name: 'bbb', id: 2 }
  // //   ]
  // // },
  appData: {
    type: Object,
    default: {
      settings: {
        shoppingListSettings: { avoidList: 'Salz ,Pfeffer ,Chili ' }
      },
      recipeList: [],
      shoppingList: [],
      weeklyPlan: []
      // recipeList: { default: [], type: Array, ref: 'recipeList' },
      // shoppingList: { type: Array, ref: 'shoppingList' },
      // weeklyPlan: { type: Array, ref: 'weeklyPlan' }
    }
  }
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

userSchema.pre(/^find/, async function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
});

// instant method
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// if password not changed or its new created dokument = return next()
userSchema.pre('save', async function(next) {
  // isNew = method of mongoose
  if (!this.isModified('password') || this.isNew) return next();
  // the database is a little slower than create token, for that issue subtract 1s
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.changePasswordAfter = async function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const Users = mongoose.model('User', userSchema);

module.exports = Users;
