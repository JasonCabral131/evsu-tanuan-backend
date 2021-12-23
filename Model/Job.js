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
  jobImage: [
    {
      url: { type: String, default: null },
      cloudinary_id: { type: String, default: null },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("job", JobSchema);
