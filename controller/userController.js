const user = require('../Models/userModel.js')
const errorhandler = require('../utils/errorhandler.js')
const jwt = require('jsonwebtoken')
const customError = require('../utils/customError.js')
const util = require('util')
const sendEmail = require('../utils/email.js')
const crypto = require('crypto')

exports.updateUser = errorhandler(async (req, res, next) => {
  //cant use this for password updation
  if (req.body.password || req.body.confirmPassword || req.body.role) {
    return next(new customError('Cant update password or role at this endpoint', 404))
  }
  //filter confidential roles
  const filterObj = reqBody => {
    const newObject = {}
    const notAllowed = ['role', 'password', 'confirmPassword']

    
    Object.keys(reqBody).forEach(key => {
      if (!notAllowed.includes(key)) {
        newObject[key] = reqBody[key]
      }
    })

    return newObject
  }

  //update user details
  const User = await user.findByIdAndUpdate(req.User._id, filterObj(req.body), {
    runValidators: true,
    new: true
  })
  res.status(200).json({
    status:"success",
    message:`successfull updated ${filterObj(req.body)}`
  })
  
})
//delete user  account by user
exports.deleteUser=errorhandler(async (req,res,next)=>{
    const User= await user.findByIdAndUpdate(req.User._id,{active:false});
    res.status(200).json({
        status:"success",
        message:`successfull deleted account`
      })
})