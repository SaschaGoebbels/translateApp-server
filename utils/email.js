// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // create transporter (service that send the email)
  // Gmail
  // // // const transporter = nodemailer.createTransport({
  // // //   service: 'gmail',
  // // //   auth: {
  // // //     user: process.env.EMAIL_USERNAME,
  // // //     pass: process.env.EMAIL_PASSWORD
  // // //   }
  // // // });
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  // define the email options
  const mailOptions = {
    from: 'Sascha Göbbels <kochstudio@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text
    // html: options.html
  };
  // send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
