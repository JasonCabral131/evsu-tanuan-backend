const mongoose = require("mongoose");

const JobApplyingSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "job",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    resume: [
      {
        url: { type: String, default: null },
        cloudinary_id: { type: String, default: null },
      },
    ],
    view: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("jobApply", JobApplyingSchema);
