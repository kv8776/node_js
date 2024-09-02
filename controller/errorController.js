const CustomError = require('./../utils/customError');

const prodErrors = (res, err) => {
  if (err.isOperational) {
    res.status(err.statuscode).json({
      status: 'failure',
      message: err.message
    });
  } else {
    res.status(err.statuscode).json({
      status: 'error',
      message: 'Something went wrong! Please try again later'
    });
  }
};

const devErrors = (res, err) => {
  const formattedError = {
    status: err.status || 'error',
    message: err.message,
    stackTrace: err.stack
  };
  res.status(err.statuscode).json(formattedError);
};

const handleExpiredJWT = (err, res) => {
  console.log(err);
  const customError = new CustomError('JWT has expired. Please login again.', 401);
  prodErrors(res, customError);
};

const handleJWTError = (err, res) => {
  console.log(err);
  const customError = new CustomError('Invalid token! Please login again.', 401);
  prodErrors(res, customError);
};

const handleValidationError = (res, err) => {
  const { errors } = err;
  const errorMessage = Object.values(errors).map(error => error.message);
  return new CustomError(errorMessage.join(', '), 400);
};

const handleDuplicateKeyError = (res, err) => {
  return new CustomError(`There is already a student registered with reg_no: ${err.keyValue.reg_no}`, 400);
};

module.exports = (err, req, res, next) => {
  err.statuscode = err.statuscode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    devErrors(res, err);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name='ValidationError') {
      err = handleValidationError(res, err);
    } else if (err.name === 'TokenExpiredError') {
      handleExpiredJWT(err, res); // Handle expired JWT error here
    } else if (err.name === 'JsonWebTokenError') {
      handleJWTError(err, res); // For invalid token
    } else if (err.name === 'DuplicateKeyError') {
      err = handleDuplicateKeyError(res, err);
    } else {
      prodErrors(res, err);
    }
  }
};
