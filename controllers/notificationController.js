const Notification = require("../models/Notification");
const Token = require("../models/Token");
const Appointment = require("../models/Appointment");

const {
  sendEmailNotification,
  simulateSmsNotification,
} = require("../utils/notificationService");

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function slotStartMinutes(timeSlot) {
  if (!timeSlot || !timeSlot.includes("-")) {
    return null;
  }

  const start = timeSlot.split("-")[0].trim();
  const [hour, minute] = start.split(":").map(Number);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function normalizeNotificationType(type) {
  if (type === "Queue Alert") return "QUEUE_ALERT";
  if (type === "Appointment Reminder") return "SLOT_REMINDER";
  if (type === "General") return "GENERAL";

  if (["QUEUE_ALERT", "SLOT_REMINDER", "GENERAL"].includes(type)) {
    return type;
  }

  return "GENERAL";
}

function buildQueueAlertMessage(token) {
  const branchName = token.branch?.name || "your selected branch";
  const serviceName =
    token.service?.serviceName ||
    token.service?.name ||
    "your selected service";
  const citizenName = token.name || token.citizenName || "Citizen";

  return `Dear ${citizenName}, your EQueue token ${token.tokenCode} is approaching. Please be ready for ${serviceName} at ${branchName}. Your current queue position is ${token.queuePosition}.`;
}

function buildAppointmentReminderMessage(appointment) {
  const branchName = appointment.branch?.name || "your selected branch";
  const serviceName =
    appointment.serviceType ||
    appointment.service?.serviceName ||
    appointment.service?.name ||
    "your selected service";

  return `Dear ${appointment.name}, this is your EQueue appointment reminder. Your appointment for ${serviceName} at ${branchName} is scheduled today at ${appointment.timeSlot}. Please arrive on time.`;
}

async function createNotificationLog({
  token = null,
  appointment = null,
  type,
  channel,
  recipientEmail = "",
  recipientPhone = "",
  subject = "",
  message,
  status,
  errorMessage = "",
}) {
  return Notification.create({
    token,
    appointment,
    type,
    channel,
    recipientEmail,
    recipientPhone,
    subject,
    message,
    status,
    sentAt: new Date(),
    errorMessage,

    email: recipientEmail,
    phone: recipientPhone,
    emailStatus: channel === "EMAIL" ? status : "",
    smsStatus: channel === "SMS" ? status : "",
    error: errorMessage,
  });
}

async function getNotifications(req, res) {
  try {
    const filter = {};

    if (req.query.email) {
      const email = req.query.email.toLowerCase();

      filter.$or = [{ recipientEmail: email }, { email }];
    }

    if (req.query.type) {
      filter.type = normalizeNotificationType(req.query.type);
    }

    const notifications = await Notification.find(filter)
      .populate("token")
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
}

async function sendNotification(req, res) {
  try {
    const { email, phone, type, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({
        message: "email, subject, and message are required",
      });
    }

    const normalizedType = normalizeNotificationType(type);

    const emailResult = await sendEmailNotification({
      to: email,
      subject,
      message,
    });

    const emailLog = await createNotificationLog({
      type: normalizedType,
      channel: "EMAIL",
      recipientEmail: email.toLowerCase(),
      recipientPhone: phone || "",
      subject,
      message,
      status: emailResult.status,
      errorMessage: emailResult.errorMessage,
    });

    let smsLog = null;

    if (phone) {
      const smsResult = simulateSmsNotification({
        to: phone,
        message,
      });

      smsLog = await createNotificationLog({
        type: normalizedType,
        channel: "SMS",
        recipientEmail: email.toLowerCase(),
        recipientPhone: phone,
        subject,
        message,
        status: smsResult.status,
        errorMessage: smsResult.errorMessage,
      });
    }

    res.status(201).json({
      message: "Notification processed",
      notification: emailLog,
      smsNotification: smsLog,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to process notification",
      error: error.message,
    });
  }
}

async function sendQueueAlerts(req, res) {
  try {
    const { branchId, date } = req.body;

    if (!branchId || !date) {
      return res.status(400).json({
        message: "branchId and date are required",
      });
    }

    const upcomingTokens = await Token.find({
      branch: branchId,
      preferredDate: date,
      status: "Waiting",
      queueAlertSent: { $ne: true },
    })
      .populate("branch")
      .populate("service")
      .sort({
        isPriority: -1,
        queuePosition: 1,
        queueNumber: 1,
        createdAt: 1,
      })
      .limit(3);

    if (upcomingTokens.length === 0) {
      return res.status(200).json({
        message: "No waiting token found for queue alert",
        notifications: [],
      });
    }

    const logs = [];

    for (const token of upcomingTokens) {
      const subject = `EQueue Queue Alert: ${token.tokenCode}`;
      const message = buildQueueAlertMessage(token);

      const emailResult = await sendEmailNotification({
        to: token.email,
        subject,
        message,
      });

      const emailLog = await createNotificationLog({
        token: token._id,
        type: "QUEUE_ALERT",
        channel: "EMAIL",
        recipientEmail: token.email,
        recipientPhone: token.phone,
        subject,
        message,
        status: emailResult.status,
        errorMessage: emailResult.errorMessage,
      });

      logs.push(emailLog);

      const smsResult = simulateSmsNotification({
        to: token.phone,
        message,
      });

      const smsLog = await createNotificationLog({
        token: token._id,
        type: "QUEUE_ALERT",
        channel: "SMS",
        recipientEmail: token.email,
        recipientPhone: token.phone,
        subject,
        message,
        status: smsResult.status,
        errorMessage: smsResult.errorMessage,
      });

      logs.push(smsLog);

      token.queueAlertSent = true;
      await token.save();
    }

    res.status(201).json({
      message: `${upcomingTokens.length} queue alert(s) processed for upcoming tokens`,
      notifications: logs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send queue alerts",
      error: error.message,
    });
  }
}

async function sendAppointmentReminders(req, res) {
  try {
    const selectedDate = req.body.date || today();

    if (selectedDate !== today()) {
      return res.status(200).json({
        message: "Appointment reminders are only sent for today's appointments",
        notifications: [],
      });
    }

    const now = currentMinutes();
    const oneHourLater = now + 60;

    const appointments = await Appointment.find({
      preferredDate: selectedDate,
      status: "Confirmed",
      reminderSent: { $ne: true },
    })
      .populate("branch")
      .populate("service")
      .sort({ timeSlot: 1 });

    const upcomingAppointments = appointments.filter((appointment) => {
      const start = slotStartMinutes(appointment.timeSlot);

      if (start === null) {
        return false;
      }

      return start >= now && start <= oneHourLater;
    });

    if (upcomingAppointments.length === 0) {
      return res.status(200).json({
        message: "No confirmed appointment found within the next 1 hour",
        notifications: [],
      });
    }

    const logs = [];

    for (const appointment of upcomingAppointments) {
      const subject = `EQueue Appointment Reminder: ${appointment.timeSlot}`;
      const message = buildAppointmentReminderMessage(appointment);

      const emailResult = await sendEmailNotification({
        to: appointment.email,
        subject,
        message,
      });

      const emailLog = await createNotificationLog({
        appointment: appointment._id,
        type: "SLOT_REMINDER",
        channel: "EMAIL",
        recipientEmail: appointment.email,
        recipientPhone: appointment.phone,
        subject,
        message,
        status: emailResult.status,
        errorMessage: emailResult.errorMessage,
      });

      logs.push(emailLog);

      const smsResult = simulateSmsNotification({
        to: appointment.phone,
        message,
      });

      const smsLog = await createNotificationLog({
        appointment: appointment._id,
        type: "SLOT_REMINDER",
        channel: "SMS",
        recipientEmail: appointment.email,
        recipientPhone: appointment.phone,
        subject,
        message,
        status: smsResult.status,
        errorMessage: smsResult.errorMessage,
      });

      logs.push(smsLog);

      appointment.reminderSent = true;
      await appointment.save();
    }

    res.status(201).json({
      message: `${upcomingAppointments.length} appointment reminder(s) processed`,
      notifications: logs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send appointment reminders",
      error: error.message,
    });
  }
}

async function deleteNotification(req, res) {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete notification",
      error: error.message,
    });
  }
}

module.exports = {
  getNotifications,
  sendNotification,
  sendQueueAlerts,
  sendAppointmentReminders,
  deleteNotification,
};
