const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const customError = require('./../utils/customError')
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
  //name , email ,password, confirm password, photo
  name: {
    type: String,
    required: [true, 'Please enter a name']
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return val == this.password
      },
      message: 'Pasword doesnt match !'
    }
  },
  active: { type: Boolean, default: true, select: false },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date
})
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  //encryption
  this.password = await bcrypt.hash(this.password, 12)
  this.confirmPassword = undefined
  next()
})
//instance to compare password in login with database;
userSchema.methods.comparePassword = async function (pswd, pswdb) {
  return bcrypt.compare(pswd, pswdb)
}
userSchema.methods.isPasswordChanged = function (timestamp) {
  if (this.passwordChangedAt) {
    const changed = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    console.log(changed)
    if (changed > timestamp) {
      return true
    }
  }
  return false
}

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000
  console.log(this.passwordResetToken, this.passwordResetTokenExpires)
  return resetToken
}

userSchema.post('save', function (obj, next) {
  console.log(`successfully registered with  ${obj.name}.`)
  next()
})

const User = mongoose.model('User', userSchema)
module.exports = User
