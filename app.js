const express = require('express');
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoSanitize = require('express-mongo-sanitize');
// eslint-disable-next-line import/no-extraneous-dependencies
const xss = require('xss-clean');
// eslint-disable-next-line import/no-extraneous-dependencies
const hpp = require('hpp');
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require('cors');

const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const recipeRouter = require('./routes/recipeRoutes');
const userRouter = require('./routes/userRoutes');
const appDataRouter = require('./routes/appDataRoutes');

const app = express();

app.use(
  cors({
    // origin: 'https://cyan-pleasant-chicken.cyclic.app',
    origin: [
      'https://papaya-crumble-be16e3.netlify.app/',
      'https://cyan-pleasant-chicken.cyclic.app'
    ],
    credentials: true
  })
);

app.use(cookieParser());

// global middleware
// set security HTTP headers
app.use(helmet());

// developing logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limiter to prevent brute force attacks and denial of service attacks
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// body parsing middleware, reading data from body into req.body
// limit body size to 10kb to prevent abuse
app.use(express.json({ limit: '10kb' }));

// data sanitization against NoSQL query injection (filter ou all $ and dots)
app.use(mongoSanitize());

// data sanitization against XSS attacks cross-site-scripting-attacks (filter bad html)
app.use(xss());

// prevent parameter pollution, should be placed at the end, cleans up query string
// optional -> whitelist:["params"]
app.use(hpp());

//serving static files
app.use(express.static(`${__dirname}/public`));

// test middleware for debugging and testing
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// routes
app.use('/api/v1/recipe', recipeRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/appData', appDataRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Url: ${req.originalUrl} nicht gefunden!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
