const mongoose = require("mongoose");

const EventSchema = mongoose.Schema({
  eventTitle: {
    type: String,
  },
  eventDescription: {
    type: String,
  },
  eventSchedule: {
    type: Date,
  },
  eventImage: [
    {
      url: { type: String, default: null },
      cloudinary_id: { type: String, default: null },
    },
  ],
  course: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("event", EventSchema);
