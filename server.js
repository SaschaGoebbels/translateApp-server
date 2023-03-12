const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

//catch uncaught exceptions
process.on('uncaughtException', err => {
  console.log('💥💥 uncaught exception - shutdown 💥💥');
  console.log(err.name, '🚩', err.message);
  process.exit(1);
});

// // // temporary solution to test development
// process.env.NODE_ENV = 'development';

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE;
const connectDB = async () => {
  try {
    // const conn =
    await mongoose
      .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      })
      .then(() => {
        console.log(
          `😁 server starting successfully 😁 Mode: ${process.env.NODE_ENV}`
        );
      });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const port = process.env.PORT || 3000;

//Connect to the database before listening
connectDB().then(() => {
  const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });
  // catch unhandled promise rejections
  process.on('unhandledRejection', err => {
    console.log('💥💥 unhandled rejection - shutdown 💥💥');
    console.log(err.name, '🚩', err.message);
    //first shutdown the server then exit the process
    server.close(() => process.exit(1));
  });
});
