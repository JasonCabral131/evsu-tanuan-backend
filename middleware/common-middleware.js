const multer = require("multer");

const shortid = require("shortid");

var storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});
exports.imageUpload = multer({ storage });
