// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["application_status_update", "job_status_update", "new_application"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId, // e.g., Application or Job ID
  },
  read: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
