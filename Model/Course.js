const mongoose = require("mongoose");

const CourseSchema = mongoose.Schema({
  courseName: {
    type: String,
  },
  courseAbbreviation: {
    type: String,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("course", CourseSchema);
