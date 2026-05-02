const Token = require("../models/Token");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");

async function getActivityByEmail(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "email query is required",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const tokens = await Token.find({
      email: normalizedEmail,
    })
      .populate("branch")
      .populate("service")
      .sort({ createdAt: -1 });

    const appointments = await Appointment.find({
      email: normalizedEmail,
    })
      .populate("branch")
      .populate("service")
      .sort({ createdAt: -1 });

    const notifications = await Notification.find({
      $or: [{ recipientEmail: normalizedEmail }, { email: normalizedEmail }],
    })
      .populate("token")
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.status(200).json({
      email: normalizedEmail,
      tokens,
      appointments,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch activity history",
      error: error.message,
    });
  }
}

module.exports = {
  getActivityByEmail,
};
