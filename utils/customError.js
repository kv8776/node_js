class customError extends Error{
   constructor(message,statuscode){
      super(message);//calling constructor of base class Error
      this.statuscode=statuscode;
      this.status= statuscode >=400 && statuscode<500 ? 'fail' : 'error';
      // creating it for further ..to know what error is
      this.isOperational=true;
      Error.captureStackTrace(this,this.constructor);
   } 
}
module.exports=customError;