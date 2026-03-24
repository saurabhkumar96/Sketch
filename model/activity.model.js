const mongoose = require("mongoose");
const ActivityLog = mongoose.model("ActivityLog", new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  roomId: String,
  action: String,
  entityType: String,
  entityId: String,
  metadata: Object,
  createdAt: {
    type: Date,
    default: Date.now
  }
}));

module.exports = ActivityLog