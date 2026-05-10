const nodemailer = require("nodemailer");

const sendEmail = async (
  to,
  subject,
  html
) => {

  try {

    const transporter =
      nodemailer.createTransport({

        service: "gmail",

        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },

      });

    await transporter.sendMail({
      from: `"Mana Panchayat" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent");

  } catch (err) {

    console.log("EMAIL ERROR 👉", err);

    throw err;

  }
};

module.exports = sendEmail;
