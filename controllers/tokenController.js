const Token = require("../models/Token");
const Branch = require("../models/Branch");
const Service = require("../models/Service");
const QueueDay = require("../models/QueueDay");
const { generateTokenCode } = require("../utils/tokenGenerator");

async function getTokens(req, res) {
  try {
    const filter = {};

    if (req.query.branchId) {
      filter.branch = req.query.branchId;
    }

    if (req.query.serviceId) {
      filter.service = req.query.serviceId;
    }

    if (req.query.date) {
      filter.preferredDate = req.query.date;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.email) {
      filter.email = req.query.email.toLowerCase();
    }

    const tokens = await Token.find(filter)
      .populate("branch")
      .populate("service")
      .sort({ createdAt: -1 });

    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tokens",
      error: error.message,
    });
  }
}

async function createToken(req, res) {
  try {
    const {
      branchId,
      serviceId,
      preferredDate,
      name,
      citizenName,
      email,
      phone,
      isPriority,
    } = req.body;

    const finalName = name || citizenName || "";

    if (
      !branchId ||
      !serviceId ||
      !preferredDate ||
      !finalName ||
      !email ||
      !phone
    ) {
      return res.status(400).json({
        message:
          "branchId, serviceId, preferredDate, name, email, and phone are required",
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    if (branch.status !== "Active") {
      return res.status(400).json({
        message: `Token cannot be created because branch is ${branch.status}`,
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const activeTokenCount = await Token.countDocuments({
      branch: branchId,
      preferredDate,
      status: { $ne: "Cancelled" },
    });

    if (activeTokenCount >= branch.dailyCapacity) {
      return res.status(400).json({
        message: "Daily capacity is full for this branch and date",
      });
    }

    const sameTypeIssuedCount = await Token.countDocuments({
      branch: branchId,
      service: serviceId,
      preferredDate,
      isPriority: Boolean(isPriority),
    });

    const queueNumber = sameTypeIssuedCount + 1;
    const tokenNumber = queueNumber;
    const tokenCode = generateTokenCode(Boolean(isPriority), queueNumber);

    const waitingCount = await Token.countDocuments({
      branch: branchId,
      preferredDate,
      status: "Waiting",
    });

    const queuePosition = waitingCount + 1;

    const estimatedWaitingTime = Math.ceil(
      (waitingCount / branch.activeCounters) * service.averageProcessingTime,
    );

    const token = await Token.create({
      branch: branchId,
      service: serviceId,
      preferredDate,
      name: finalName,
      citizenName: finalName,
      email: email.toLowerCase(),
      phone,
      isPriority: Boolean(isPriority),
      queueNumber,
      tokenNumber,
      tokenCode,
      queuePosition,
      estimatedWaitingTime,
      status: "Waiting",
      queueAlertSent: false,
    });

    await QueueDay.findOneAndUpdate(
      { branch: branchId, date: preferredDate },
      {
        $inc: {
          totalTokens: 1,
          waitingCount: 1,
        },
      },
      { upsert: true, new: true },
    );

    const savedToken = await Token.findById(token._id)
      .populate("branch")
      .populate("service");

    res.status(201).json({
      message: "Token generated successfully",
      token: savedToken,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to generate token",
      error: error.message,
    });
  }
}

async function deleteToken(req, res) {
  try {
    const token = await Token.findByIdAndDelete(req.params.id);

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    res.status(200).json({
      message: "Token deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete token",
      error: error.message,
    });
  }
}

module.exports = {
  getTokens,
  createToken,
  deleteToken,
};
