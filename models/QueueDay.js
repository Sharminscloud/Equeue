const mongoose = require("mongoose");

const queueDaySchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    waitingCount: {
      type: Number,
      default: 0,
    },
    servingCount: {
      type: Number,
      default: 0,
    },
    completedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

queueDaySchema.index({ branch: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("QueueDay", queueDaySchema);
