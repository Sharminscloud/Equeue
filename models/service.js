const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Service category is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    averageProcessingTime: {
      type: Number,
      required: [true, "Average processing time is required"],
      min: [1, "Average processing time must be at least 1 minute"],
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    serviceFee: {
      type: Number,
      default: 0,
    },
    priorityLevel: {
      type: String,
      enum: ["Normal", "Medium", "High"],
      default: "Normal",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Service", serviceSchema);
