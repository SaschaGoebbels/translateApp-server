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
  // const value = err.err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value >> ${err.keyValue.name} << Please change value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonWebToken = () => new AppError('Invalid token', 401);

// error controller
module.exports = (err, req, res, next) => {
  // default error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = { ...err };
    let error = Object.assign(err);
    if (error.statusCode === '404') error = handleCastErrorDB(error);
    // if recipe already exist
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    // if recipeName is empty or other validation
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJsonWebToken();
    }
    sendErrorProd(error, res);
  }
};
