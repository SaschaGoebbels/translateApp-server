const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

//temporary solution to test production
// process.env.NODE_ENV = 'production';

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() =>
    console.log(
      `✅ server starting successfully 💥 Mode: ${process.env.NODE_ENV}`
    )
  );

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
