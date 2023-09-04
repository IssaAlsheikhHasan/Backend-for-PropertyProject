const nodemailer = require('nodemailer');
require('dotenv').config();
const HTML_TEMPLATE = ({userName,code}) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset Request</title>
          <style>
            .container {
              width: 100%;
              height: 100%;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .email {
              width: 80%;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
            }
            .email-header {
              background-color: #333;
              color: #fff;
              padding: 20px;
              text-align: center;
            }
            .email-body {
              padding: 20px;
            }
            .email-footer {
              background-color: #333;
              color: #fff;
              padding: 20px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email">
              <div class="email-header">
                <h1>You have asked for Password Reset Code</h1>
              </div>
              <div class="email-body">
                <p>Hello ${userName},</p>
                <p>Here is the code below to change your password</p>
                <p>${code}</p>
              </div>
              <div class="email-footer">
                <p>If you did not ask for this link you can safely ignore this message.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
}
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    },
});
  
const sendmail = async (mailDetails, callback) => {
    try {
      const info = await transporter.sendMail(mailDetails)
      callback(info);
    } catch (error) {
      console.log(error);
    } 
};

module.exports = async (email, userName, code) => {
    const options = {
        from: `Password Reset Request <${process.env.EMAIL}>`, // sender address
        to: email, // receiver email
        subject: "Here is your password reset code", // Subject line
        html: HTML_TEMPLATE({userName, code})
    };
    await sendmail(options, (info) => {
      console.log("MESSAGE ID: ", info.messageId);
    });
}