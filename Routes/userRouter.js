const express = require('express');
const functions=require('./../controller/userController');
const userLogin=require('./../controller/authController');

const router=express.Router();
router.route('/updateMe').patch(userLogin.protect,functions.updateUser);
router.route('/deleteMe').delete(userLogin.protect,functions.deleteUser);
module.exports=router;