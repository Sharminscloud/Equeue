const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
      default: null,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    type: {
      type: String,
      enum: ["QUEUE_ALERT", "SLOT_REMINDER", "GENERAL"],
      required: true,
    },

    channel: {
      type: String,
      enum: ["EMAIL", "SMS"],
      required: true,
    },

    recipientEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    recipientPhone: {
      type: String,
      default: "",
      trim: true,
    },

    subject: {
      type: String,
      default: "",
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["SENT", "FAILED", "SIMULATED"],
      required: true,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },

    errorMessage: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    emailStatus: {
      type: String,
      enum: ["SENT", "FAILED", "SIMULATED", ""],
      default: "",
    },

    smsStatus: {
      type: String,
      enum: ["SENT", "FAILED", "SIMULATED", ""],
      default: "",
    },

    error: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
