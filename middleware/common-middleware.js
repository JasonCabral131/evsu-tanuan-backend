const multer = require("multer");

const shortid = require("shortid");

var storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});
exports.imageUpload = multer({ storage });

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "evsu.alumni2000@gmail.com",
    pass: "123qweasdzxcA!",
  },
});

exports.sendingEmail = (mailOption) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOption, function (error, info) {
      if (error) {
        console.log("Email Error sent: " + error);
        resolve(false);
      } else {
        console.log("Email Success sent: " + info);
        resolve(true);
      }
    });
  });
};
