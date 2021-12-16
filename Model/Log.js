const mongoose = require("mongoose");

const LogSchema = mongoose.Schema({
  name: {
    type: String,
  },
  logDescription: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("log", LogSchema);
