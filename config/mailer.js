const nodemailer = require("nodemailer");

const sendEmail = async (name ,email, subject, random) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            }
        });
     
        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            html:`
            <h1>Hi ${name} your</h1>
            <h2>${subject}</h2>
            <h3 style={{color:"green"}}>${random}</h3>            
            `
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;