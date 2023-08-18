const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: "abc",
    port: 587 ,
    auth: {
      user: "abc",
      pass: "abc"
    }
});

const sendEmail = (email, verificationCode, subject) => {
    const mailOptions = {
        from: "noreply@test.com",
        to: email,
        subject: subject,
        html: `<p>Your verification code is ${verificationCode} </p>`,
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
    });
};

module.exports = { sendEmail };
