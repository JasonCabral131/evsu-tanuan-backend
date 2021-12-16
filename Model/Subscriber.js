const mongoose = require("mongoose");

const SubscriberSchema = mongoose.Schema({
  subscriberEmail: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("subscriber", SubscriberSchema);
