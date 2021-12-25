const mongoose = require("mongoose");

const NotifyUser = new mongoose.Schema(
  {
    link: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    course: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "course",
        },
      },
    ],
    viewedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],
    Date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("notify_users", NotifyUser);
