const nodemailer = require("nodemailer");

const sendEmail = async (
  to,
  subject,
  html
) => {

  try {

    const transporter =
      nodemailer.createTransport({

        host: "smtp.gmail.com",

        port: 587,

        secure: false,

        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },

        tls: {
          rejectUnauthorized: false,
        },

      });

    await transporter.sendMail({
      from: `"Mana Panchayat" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully");

  } catch (err) {

    console.log("EMAIL ERROR 👉", err);

    throw err;

  }
};

module.exports = sendEmail;
