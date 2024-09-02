
const express = require('express')
const morgan=require('morgan')
const namesroutes=require('./Routes/detailsroute');
const customError=require('./utils/customError.js');
const globalErrorHandler=require('./controller/errorController.js');
const authRouter=require('./Routes/authRouter.js');
const userRouter=require('./Routes/userRouter.js');
const rateLimit=require('express-rate-limit');
const helmet =require('helmet');
const sanitize= require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');
//  console.log("new request bro");
//  res.end(html)
//});
//server.listen(3000, "127.0.0.1", () => { //console.log("server start ayyindi bro");});

//USING EXPRESS

const app = express();
app.use(helemt());
app.setMaxListeners(25); // Set the limit to 15, for example

//creating custom middleware
////const middleware= function(req,res,next){
 // console.log('created custom middleware');
//next();
//}


app.use(express.json({limit:'10kb'}));//converts json data from user to js object
//app.use(middleware);
app.use('xss');
app.use(sanitize());//middle ware to sanitize req data from user
app.use(hpp());//middleware to avoid parameter pollution
let limiter=rateLimit({
    max:1000,
    windowMs:60*60*1000,
    message:"too many requests in one hour! please try later"
});
app.use('/api',limiter);
app.use(express.static('./public'));
if(process.env.NODE_ENV==="development"){
    app.use(morgan('dev')); // morgan is just used for  knowing time required for getting info in terminal, so we are  using it in just devlopment area
}

//app.get('/api/details', getallnames);
//app.post('/api/details',postname );
//app.get('/api/details/:id',getbyid );
//app.patch('/api/details/:id', updatename);
//app.delete('/api/details/:id', deletename);
app.use('/api/details',namesroutes);
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
//route to match un menrioned urls 
app.all('*',(req,res,next)=>{
    //   res.status(404).json({
     //   status:'failure',
      //  message:`cant find ${req.originalUrl}`
    //}) // this is normal type of sending error ..lets use  global err middle ware to send err
    // const err= new Error(`cant find ${req.originalUrl}`); //creating new error obj
   // err.status=500;
   const err=new customError(`cant find ${req.originalUrl}`,404);
   next(err);//sendinf err object to next middle ware ..here node finds err and skip all remainging middlewares to directly global err middleware
})
//global error handler
app.use(globalErrorHandler);

module.exports=app;