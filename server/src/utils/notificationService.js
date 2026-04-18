import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import Notification from "../models/Notification.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env explicitly
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log("REAL EMAIL SENT TO:", to);
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error.message);
    return { success: false, error: error.message };
  }
};

const sendSMS = async ({ to, text }) => {
  try {
    console.log("SMS TO:", to);
    console.log("TEXT:", text);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const sendQueueAlertNotification = async (token) => {
  const message = `Dear ${token.citizenName || "User"}, your token ${token.tokenNumber} is approaching. Please be ready.`;

  if (token.email) {
    const emailResult = await sendEmail({
      to: token.email,
      subject: "Queue Alert",
      text: message,
    });

    await Notification.create({
      token: token._id,
      type: "QUEUE_ALERT",
      channel: "EMAIL",
      recipientEmail: token.email,
      message,
      status: emailResult.success ? "SENT" : "FAILED",
      errorMessage: emailResult.success ? "" : emailResult.error,
    });
  }

  if (token.phone) {
    const smsResult = await sendSMS({
      to: token.phone,
      text: message,
    });

    await Notification.create({
      token: token._id,
      type: "QUEUE_ALERT",
      channel: "SMS",
      recipientPhone: token.phone,
      message,
      status: smsResult.success ? "SENT" : "FAILED",
      errorMessage: smsResult.success ? "" : smsResult.error,
    });
  }
};

export const sendSlotReminderNotification = async (appointment) => {
  const message = `Reminder: your appointment is scheduled at ${new Date(
    appointment.appointmentDateTime
  ).toLocaleString()}.`;

  if (appointment.email) {
    const emailResult = await sendEmail({
      to: appointment.email,
      subject: "Appointment Reminder",
      text: message,
    });

    await Notification.create({
      appointment: appointment._id,
      type: "SLOT_REMINDER",
      channel: "EMAIL",
      recipientEmail: appointment.email,
      message,
      status: emailResult.success ? "SENT" : "FAILED",
      errorMessage: emailResult.success ? "" : emailResult.error,
    });
  }

  if (appointment.phone) {
    const smsResult = await sendSMS({
      to: appointment.phone,
      text: message,
    });

    await Notification.create({
      appointment: appointment._id,
      type: "SLOT_REMINDER",
      channel: "SMS",
      recipientPhone: appointment.phone,
      message,
      status: smsResult.success ? "SENT" : "FAILED",
      errorMessage: smsResult.success ? "" : smsResult.error,
    });
  }
};