const express = require('express');
const morgan = require('morgan');

const recipeRouter = require('./routes/recipeRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/recipe', recipeRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  const err = new Error(`Url: ${req.originalUrl} nicht gefunden!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
  // res.status(404).json({ message: `Url: ${req.originalUrl} nicht gefunden!` });
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({ status: err.status, message: err.message });
});

module.exports = app;
