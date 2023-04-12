const path = require('path');
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
const authController = require('./controllers/authController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use('/styles', express.static(path.join(__dirname, '/css/style.css'))); //DELETE doesn't work
//serve static files
// app.use(express.static(path.join(__dirname, 'static')));
app.use(
  cors({
    origin: ['https://kochstudio-react.netlify.app',
    'http://localhost:3001',
    'http://127.0.0.1:3000'],
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
app.use(express.json({ limit: '500kb' }));

app.use(express.urlencoded({ extended: true, limit: '500kb' }));

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
// // // app.get(
// // //   '/submitPassword/:token',
// // //   // authController.submitPassword
// // //   (req, res) => {
// // //     const parameters = req.body;
// // //     parameters.token = req.token;
// // //     res.status(200).render('submitPassword', {
// // //       userName: 'req.userName',
// // //       confirmStatus: false
// // //     });
// // //   }
// // // );

app.use('/api/v1/recipe', recipeRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/appData', appDataRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Url: ${req.originalUrl} nicht gefunden!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
