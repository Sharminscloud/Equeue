import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },
    preferredDate: {
      type: String,
      required: true
    },
    isPriority: {
      type: Boolean,
      default: false
    },
    queueNumber: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["waiting", "approaching", "served", "cancelled"],
      default: "waiting"
    },
    citizenName: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    queueAlertSent: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.models.Token || mongoose.model("Token", tokenSchema);