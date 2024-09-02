const user = require('./../Models/userModel')
const errorhandler = require('./../utils/errorhandler.js')
const jwt = require('jsonwebtoken')
const customError = require('./../utils/customError.js')
const util = require('util');
const sendEmail=require('./../utils/email.js');
const crypto=require('crypto')
//token generator
const tokenGenarator = id => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES
  })
}
//to  role of the logged person

exports.restrict = errorhandler(async (req, res, next) => {
  if (req.User.role !== 'admin') {
    const err = new customError('You do not have permission to perform this action', 400);
    return next(err);
  }
  next();
});
//return (req,res,next)=>{
//  if(req.User.role!=role){
//    const err=new customError('You do not have permission to perform this action',400);
//    return next(err);
 // }
 // next();
//}//
// sign up function
exports.signup = errorhandler(async (req, res, next) => {
  const newUser = await user.create(req.body)
  const token = tokenGenarator(newUser._id);

const options={
  expires:process.env.LOGIN_EXPIRES,
  httpOnly:true,
  secure:false
}
if(process.env.NODE_ENV=="production"){
  options.secure=true;
}
res.cookie("jwt",token,options);
 // res.status(201).json({
 // //  status: 'success',
 //   token,
 //   data: {
  //    user: newUser
 //   }
 // })
})

//login function
exports.login = errorhandler(async (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  //or
  //const {email,passwordreq.body;
  //checking if email is provided
  if (!email || !password) {
    const error = new customError('please provide email and password for login',400)
    return next(error)
  }
  //check if user exists with given email
  const User = await user.findOne({ email }).select('+password')
  let isMatch = false
  if (!User) {
    const err = new customError(`cant find user with ${email}`, 400)
    next(err)
  } else {
    isMatch = await User.comparePassword(password, User.password)
  }

  if (!isMatch) {
    const error = new customError('Incorrect email or password', 400)
    return next(error)
  }


  const token = tokenGenarator(User._id);
  const options={
    maxAge:process.env.LOGIN_EXPIRES,
    httpOnly:true,
    secure:false
  }
  if(process.env.NODE_ENV=="production"){
    options.secure=true;
  }
  res.cookie("jwt",token,options);
  res.status(200).json({
    status: 'success',
    token
    //cant send passowrd to user again :)
  })
})

//moddleware to check user logged in
exports.protect = errorhandler(async (req, res, next) => {
  // 1. Read the token if it exists
  const raw_token = req.headers.authorization
  console.log(raw_token)
  let token;
  if (raw_token && raw_token.startsWith("Bearer")){
    console.log('hi raa');
    token = raw_token.split(' ')[1]
    console.log(token)
  }

  if (!token) {
    return next(new customError('You are not logged in', 401))
  }

  // 2. Validate token
  console.log(process.env.SECRET_STR);
  const decodedToken=await util.promisify(jwt.verify)(token,process.env.SECRET_STR);
  console.log(decodedToken);


    // 3. If user exists
 const User=await user.findById(decodedToken.id);
 if(!User){
    const err =new customError('The user with given Token doesnt exist',401);
    next(err);
 }

 // 4. If the user changed password after token issuance
 const ischanged=await User.isPasswordChanged(decodedToken.iat);
 if(ischanged){
    const err=new customError('password changed recently ,please login',401);
    return next(err);
 };
 req.User=User;
  next();
})

//forgot password
exports.forgotPassword = errorhandler(async (req, res, next) => {
  // Get user based on email
  const User = await user.findOne({ email: req.body.email });
  if (!User) {
      const err = new customError('Cannot find user with given email', 404);
      return next(err);
  }

  // Generate reset token and save user
  const resetToken = await User.createResetPasswordToken();
  User.save({ validateBeforeSave: false });

  // Generate reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/api/users/passwordReset/${resetToken}`;
  const message = `We received a password reset request. Please use the below URL to reset your password:\n\n${resetUrl}\n\nThis URL is valid only for 10 minutes`;

  try {
      // Send password reset email
      await sendEmail({
          email: User.email,
          subject: 'Password Reset Request',
          message: message
      });

      res.status(200).json({
          status: "success",
          message: 'Email sent successfully'
      });
  } catch (err) {
      // Handle errors
      console.log('Error sending password reset email:'+err);
      User.passwordResetToken = undefined;
      User.passwordResetTokenExpires = undefined;
      User.save({ validateBeforeSave: false });
      return next(new customError('There was an error sending the password reset email', 500));
  }
});

exports.passwordReset =errorhandler(async (req,res,next)=>{

  const URLtoken=crypto.createHash('sha256').update(req.params.token).digest('hex');
  const User =await user.findOne({passwordResetToken:URLtoken,passwordResetTokenExpires:{$gte:Date.now()}});

  if(!User){
     next(new customError('Token is invalid or Expired',400));
  }
  if(req.body.password==User.password){
    next(new customError('passoword cant be same as previous one!',404));
  }
  User.password=req.body.password;
  User.confirmPassword=req.body.confirmPassword;
  User.passwordResetToken=undefined;
  User.passwordResetTokenExpires=undefined;
  User.passwordChangedAt=Date.now();
  await User.save({ validateBeforeSave: true });
//login user
const token = tokenGenarator(User._id);
const options={
  maxAge:process.env.LOGIN_EXPIRES,
  httpOnly:true,
  secure:false
}
if(process.env.NODE_ENV=="production"){
  options.secure=true;
}
res.cookie("jwt",token,options);
res.status(200).json({
 status: "success",
 token
  //cant send passowrd to user again :)
})

});
