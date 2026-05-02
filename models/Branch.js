const mongoose = require("mongoose");

const workingHoursSchema = new mongoose.Schema(
  {
    open: {
      type: String,
      required: [true, "Opening time is required"],
    },
    close: {
      type: String,
      required: [true, "Closing time is required"],
    },
  },
  { _id: false },
);

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Branch address is required"],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
    },
    workingHours: {
      type: workingHoursSchema,
      required: true,
    },
    dailyCapacity: {
      type: Number,
      required: [true, "Daily capacity is required"],
      min: [1, "Daily capacity must be at least 1"],
    },
    activeCounters: {
      type: Number,
      required: [true, "Active counter number is required"],
      min: [1, "Active counter must be at least 1"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Maintenance"],
      default: "Active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Branch", branchSchema);
