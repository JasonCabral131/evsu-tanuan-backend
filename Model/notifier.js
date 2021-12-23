const mongoose = require("mongoose");

const notifier = new mongoose.Schema(
  {
    link: {
      type: String,
    },
    message: {
      type: String,
    },
    viewed: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notifier", notifier);
