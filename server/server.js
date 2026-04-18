import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import dataRoutes from "./src/routes/dataRoutes.js";
import tokenRoutes from "./src/routes/tokenRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import { startReminderScheduler } from "./src/utils/reminderScheduler.js";
import appointmentRoutes from "./src/routes/appointmentRoutes.js";

dotenv.config();

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Queue System API is running" });
});

app.use("/api/data", dataRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/appointments", appointmentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startReminderScheduler();
});