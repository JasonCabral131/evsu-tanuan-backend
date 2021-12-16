const mongoose = require("mongoose");

const JobSchema = mongoose.Schema({
  jobTitle: {
    type: String,
  },
  jobCompany: {
    type: String,
  },
  jobDescription: {
    type: String,
  },
  jobImage: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("job", JobSchema);
