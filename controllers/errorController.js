const AppError = require('./../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  } else {
    console.error('💥💥💥 Error:', err);
    // res.status(err.statusCode).json({ status: err.status, message: err });
    res
      .status(500)
      .json({ status: 'error', message: 'Es ist etwas schiefgelaufen!' });
  }
};

// db error handler
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldDB = err => {
  const value = err.err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log('🚩', value);
  // console.log('😫', value);
  const message = `Duplicate field value ${value} Please change value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = () => {
  //
};

// error controller
module.exports = (err, req, res, next) => {
  ////////////////// CHECK ////////////////// err.name
  // console.log('❌', err.name);
  // default error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...{ err } };

    if (error.err.name === 'CastError') error = handleCastErrorDB(error);
    if (error.err.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.err.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
};
