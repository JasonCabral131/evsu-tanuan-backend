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
      type: String,
      default: "",
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("event", EventSchema);
