const mongoose = require("mongoose");

const CourseSchema = mongoose.Schema({
  courseName: {
    type: String,
  },
  courseAbbreviation: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "archived"],
    default: "active",
  },
});

module.exports = mongoose.model("course", CourseSchema);
