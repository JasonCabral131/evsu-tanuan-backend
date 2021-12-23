const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  firstname: {
    type: String,
  },
  middlename: {
    type: String,
  },
  lastname: {
    type: String,
  },
  sex: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  placeOfBirth: {
    type: String,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "course",
  },
  yearGraduated: {
    type: String,
  },
  presentOccupation: {
    type: String,
  },
  companyAddress: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  profile: {
    url: { type: String, default: null },
    cloudinary_id: { type: String, default: null },
  },
  status: {
    type: String,
    enum: ["active", "pending", "banned", "archived"],
    default: "pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("user", UserSchema);
