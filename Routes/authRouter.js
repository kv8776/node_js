const express = require('express');
const functions=require('./../controller/authController');

const router=express.Router();

router.route('/signup').post(functions.signup);
router.route('/login').post(functions.login);
router.route('/forgotPassword').post(functions.forgotPassword);
router.route('/passwordReset/:token').patch(functions.passwordReset);
module.exports=router;