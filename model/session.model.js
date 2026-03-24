const mongoose = require("mongoose");

const Session = mongoose.model("Session", new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  sessionId: String,
  roomId: String,
  ipAddress: String,
  userAgent: String,
  screen: {
    width: Number,
    height: Number
  },
  lastLogin: Date,
  lastActiveAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}));

module.exports = Session

