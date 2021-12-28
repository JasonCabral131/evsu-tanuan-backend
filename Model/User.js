const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      default: "",
    },
    middlename: {
      type: String,
      default: "",
    },
    lastname: {
      type: String,
      default: "",
    },
    sex: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: Date,
      default: "",
    },
    placeOfBirth: {
      type: String,
      default: "",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
    },
    yearGraduated: {
      type: String,
      default: "",
    },
    presentOccupation: {
      type: String,
      default: "none",
    },
    companyAddress: {
      type: String,
      default: "none",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },
    profile: {
      url: { type: String, default: "" },
      cloudinary_id: { type: String, default: "" },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", UserSchema);
