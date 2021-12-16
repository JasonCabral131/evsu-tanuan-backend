const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

// Password Generator
const generator = require("generate-password");
const generatedPassword = generator.generate({
  length: 14,
  numbers: true,
  symbols: false,
  lowercase: true,
  uppercase: true,
});

// User Model
const User = require("../Model/User");

//Models
const Subscriber = require("../Model/Subscriber");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "evsutracer@gmail.com",
    pass: "123qweasdzxcA!",
  },
});

router.post("/", async (req, res) => {
  const { email } = req.body;

  console.log(email);

  const userExist = await User.findOne({ email });

  if (!userExist) {
    return res.status(400).json({ msg: "Email does not exist!" });
  }

  // Hashing New Password Password
  const salt = 10;
  const hashedPassword = await bcrypt.hash(generatedPassword, salt);

  // Updating new password and submitting hashed new password
  await User.updateOne(
    { userExist },
    {
      $set: {
        password: hashedPassword,
      },
    }
  );

  try {
    var mailOptions = {
      from: "evsutracer@gmail.com",
      to: email,
      subject: "Reset Password",
      text: "Alumni Tracer Reset Password",
      html: `
      <body>
        <img src="https://www.evsu.edu.ph/wp-content/uploads/2020/01/EVSU-Logo.png"/>
        <h1> Evsu Alumni Tracer </h1> 
        <p> New Password: <b> ${generatedPassword} </b> </p>
      </body>
      `,
    };

    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        // Check Emails Error
        console.log(error);
        console.log(`Error response code ${error.responseCode}`);

        if (error.responseCode == 553) {
          return res.status(400).json({ msg: "Email does not exist" });
        }
        res.status(500).json({ msg: "Server Error Only" });
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json({
          msg: "New password sent! Check your email for new password",
        });
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error " });
  }
});

module.exports = router;
