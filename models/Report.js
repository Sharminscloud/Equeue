const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportName: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
    metrics: {
      totalTokens: {
        type: Number,
        default: 0,
      },
      totalUsersServed: {
        type: Number,
        default: 0,
      },
      totalAppointments: {
        type: Number,
        default: 0,
      },
      averageWaitingTime: {
        type: Number,
        default: 0,
      },
      queuePerformanceScore: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
