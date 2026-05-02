const Token = require("../models/Token");
const QueueDay = require("../models/QueueDay");
const { triggerQueueUpdate } = require("../utils/pusher");

async function getQueueTokens(req, res) {
  try {
    const tokens = await Token.find()
      .populate("branch")
      .populate("service")
      .sort({ preferredDate: -1, tokenNumber: 1 });

    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch queue tokens",
      error: error.message,
    });
  }
}

async function updateTokenStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["Waiting", "Serving", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    const oldStatus = token.status;
    token.status = status;
    await token.save();

    if (oldStatus !== status) {
      const update = {};

      if (oldStatus === "Waiting") {
        update.waitingCount = -1;
      }

      if (oldStatus === "Serving") {
        update.servingCount = -1;
      }

      if (oldStatus === "Completed") {
        update.completedCount = -1;
      }

      if (status === "Waiting") {
        update.waitingCount = (update.waitingCount || 0) + 1;
      }

      if (status === "Serving") {
        update.servingCount = (update.servingCount || 0) + 1;
      }

      if (status === "Completed") {
        update.completedCount = (update.completedCount || 0) + 1;
      }

      await QueueDay.findOneAndUpdate(
        { branch: token.branch, date: token.preferredDate },
        { $inc: update },
        { upsert: true },
      );
    }

    const populatedToken = await Token.findById(token._id)
      .populate("branch")
      .populate("service");

    await triggerQueueUpdate({
      tokenId: populatedToken._id,
      tokenCode: populatedToken.tokenCode,
      status: populatedToken.status,
      branch: populatedToken.branch ? populatedToken.branch.name : "",
    });

    res.status(200).json({
      message: "Token status updated successfully",
      token: populatedToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update token status",
      error: error.message,
    });
  }
}

module.exports = {
  getQueueTokens,
  updateTokenStatus,
};
