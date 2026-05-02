const Token = require("../models/Token");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");

const {
  sendEmailNotification,
  simulateSmsNotification,
} = require("./notificationService");

const QUEUE_ALERT_THRESHOLD = 3;
const SLOT_REMINDER_MINUTES = 60;
const SCHEDULER_INTERVAL_MS = 60000;

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function getSlotStartMinutes(timeSlot) {
  if (!timeSlot || !timeSlot.includes("-")) {
    return null;
  }

  const startTime = timeSlot.split("-")[0].trim();
  const [hour, minute] = startTime.split(":").map(Number);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour * 60 + minute;
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

async function checkQueueAlerts() {
  try {
    const tokens = await Token.find({
      status: "Waiting",
      queueAlertSent: { $ne: true },
      queuePosition: { $lte: QUEUE_ALERT_THRESHOLD },
    })
      .populate("branch")
      .populate("service")
      .sort({
        isPriority: -1,
        queuePosition: 1,
        queueNumber: 1,
        createdAt: 1,
      });

    for (const token of tokens) {
      const subject = `EQueue Queue Alert: ${token.tokenCode}`;
      const message = buildQueueAlertMessage(token);

      const emailResult = await sendEmailNotification({
        to: token.email,
        subject,
        message,
      });

      await createNotificationLog({
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

      const smsResult = simulateSmsNotification({
        to: token.phone,
        message,
      });

      await createNotificationLog({
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

      token.queueAlertSent = true;
      await token.save();
    }
  } catch (error) {
    console.error("Queue alert error:", error.message);
  }
}

async function checkSlotReminders() {
  try {
    const selectedDate = getTodayDate();
    const nowMinutes = getCurrentMinutes();
    const endWindowMinutes = nowMinutes + SLOT_REMINDER_MINUTES;

    const appointments = await Appointment.find({
      preferredDate: selectedDate,
      status: "Confirmed",
      reminderSent: { $ne: true },
    })
      .populate("branch")
      .populate("service")
      .sort({ timeSlot: 1 });

    const upcomingAppointments = appointments.filter((appointment) => {
      const startMinutes = getSlotStartMinutes(appointment.timeSlot);

      if (startMinutes === null) {
        return false;
      }

      return startMinutes >= nowMinutes && startMinutes <= endWindowMinutes;
    });

    for (const appointment of upcomingAppointments) {
      const subject = `EQueue Appointment Reminder: ${appointment.timeSlot}`;
      const message = buildAppointmentReminderMessage(appointment);

      const emailResult = await sendEmailNotification({
        to: appointment.email,
        subject,
        message,
      });

      await createNotificationLog({
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

      const smsResult = simulateSmsNotification({
        to: appointment.phone,
        message,
      });

      await createNotificationLog({
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

      appointment.reminderSent = true;
      await appointment.save();
    }
  } catch (error) {
    console.error("Slot reminder error:", error.message);
  }
}

function startReminderScheduler() {
  console.log("Jakia reminder scheduler started");

  setInterval(async () => {
    await checkQueueAlerts();
    await checkSlotReminders();
  }, SCHEDULER_INTERVAL_MS);
}

module.exports = {
  checkQueueAlerts,
  checkSlotReminders,
  startReminderScheduler,
};
