const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    preferredDate: {
      type: String,
      required: [true, "Preferred date is required"],
    },

    name: {
      type: String,
      required: [true, "Citizen name is required"],
      trim: true,
    },

    citizenName: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Citizen email is required"],
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    isPriority: {
      type: Boolean,
      default: false,
    },

    queueNumber: {
      type: Number,
      required: true,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },

    tokenCode: {
      type: String,
      required: true,
      trim: true,
    },

    queuePosition: {
      type: Number,
      required: true,
    },

    estimatedWaitingTime: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Waiting", "Serving", "Completed", "Cancelled"],
      default: "Waiting",
    },

    queueAlertSent: {
      type: Boolean,
      default: false,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

tokenSchema.index(
  {
    branch: 1,
    service: 1,
    preferredDate: 1,
    isPriority: 1,
    queueNumber: 1,
  },
  { unique: true },
);

module.exports = mongoose.model("Token", tokenSchema);
