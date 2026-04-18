import Token from "../models/Token.js";
import Appointment from "../models/Appointment.js";
import {
  sendQueueAlertNotification,
  sendSlotReminderNotification
} from "./notificationService.js";

const QUEUE_ALERT_THRESHOLD = 3;
const SLOT_REMINDER_MINUTES = 60;

export const checkQueueAlerts = async () => {
  try {
    const tokens = await Token.find({
      status: "waiting",
      queueAlertSent: false
    }).sort({ queueNumber: 1 });

    for (const token of tokens) {
      if (token.queueNumber <= QUEUE_ALERT_THRESHOLD) {
        await sendQueueAlertNotification(token);

        token.queueAlertSent = true;
        token.status = "approaching";
        await token.save();
      }
    }
  } catch (error) {
    console.error("Queue alert error:", error.message);
  }
};

export const checkSlotReminders = async () => {
  try {
    const now = new Date();
    const endWindow = new Date(
      now.getTime() + SLOT_REMINDER_MINUTES * 60 * 1000
    );

    const appointments = await Appointment.find({
      status: "confirmed",
      reminderSent: false,
      appointmentDateTime: {
        $gte: now,
        $lte: endWindow
      }
    });

    for (const appointment of appointments) {
      await sendSlotReminderNotification(appointment);
      appointment.reminderSent = true;
      await appointment.save();
    }
  } catch (error) {
    console.error("Slot reminder error:", error.message);
  }
};

export const startReminderScheduler = () => {
  console.log("Reminder Scheduler started...");

  setInterval(async () => {
    await checkQueueAlerts();
    await checkSlotReminders();
  }, 60000); 
};