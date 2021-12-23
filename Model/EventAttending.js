const mongoose = require("mongoose");

const EventAttendingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    view: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("eventAttending", EventAttendingSchema);
