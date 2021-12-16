const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
  },
  middleName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  accountStatus: {
    type: String,
    default: "invalid",
  },
  phoneNumber: {
    type: String,
  },
  age: {
    type: String,
  },
  sex: {
    type: String,
  },
  batch: {
    type: String,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "course",
  },
  status: {
    type: String,
  },
  currentWork: {
    type: String,
    default: "None",
  },
  monthlyIncome: {
    type: String,
  },
  yearlyIncome: {
    type: String,
  },
  jobExperience: {
    type: String,
  },
  image: {
    type: String,
  },
  profile: {
    url: { type: String, default: null },
    cloudinaryId: { type: String, default: null },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("user", UserSchema);
