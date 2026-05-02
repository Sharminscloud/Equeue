const express = require("express");
const router = express.Router();

const {
  getNotifications,
  sendNotification,
  sendQueueAlerts,
  sendAppointmentReminders,
  deleteNotification,
} = require("../controllers/notificationController");

router.get("/", getNotifications);

router.post("/send", sendNotification);

router.post("/queue-alerts", sendQueueAlerts);

router.post("/appointment-reminders", sendAppointmentReminders);

router.delete("/:id", deleteNotification);

module.exports = router;
