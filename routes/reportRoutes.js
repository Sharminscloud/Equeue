const express = require("express");
const Report = require("../models/Report");
const Appointment = require("../models/Appointment");

const router = express.Router();

router.get("/generate", async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
      status: "Served",
    };

    if (branchId) {
      query.branch = branchId;
    }

    const servedAppointments = await Appointment.find(query);

    const totalUsersServed = servedAppointments.length;
    let totalWaitTimeMs = 0;

    // Calculate average wait time
    servedAppointments.forEach((appt) => {
      if (appt.servedAt && appt.createdAt) {
        totalWaitTimeMs += appt.servedAt - appt.createdAt;
      }
    });

    const averageWaitTimeMs =
      totalUsersServed > 0 ? totalWaitTimeMs / totalUsersServed : 0;
    const averageWaitTimeMinutes = Math.round(averageWaitTimeMs / (1000 * 60));

    let queuePerformanceScore = "Standard";
    if (averageWaitTimeMinutes <= 15) {
      queuePerformanceScore = "Excellent";
    } else if (averageWaitTimeMinutes <= 30) {
      queuePerformanceScore = "Good";
    } else {
      queuePerformanceScore = "Poor";
    }

    res.json({
      startDate,
      endDate,
      branchId,
      metrics: {
        totalUsersServed,
        averageWaitTime: averageWaitTimeMinutes,
        queuePerformanceScore,
      },
    });
  } catch (error) {
    console.error("Failed to generate report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

router.post("/save", async (req, res) => {
  try {
    const { reportName, dateRange, branch, metrics } = req.body;

    if (!reportName || !dateRange || !metrics) {
      return res.status(400).json({ error: "Missing required report fields" });
    }

    const report = await Report.create({
      reportName,
      dateRange,
      branch: branch || null,
      metrics,
    });

    res.status(201).json(report);
  } catch (error) {
    console.error("Failed to save report:", error);
    res.status(500).json({ error: "Failed to save report" });
  }
});

router.get("/", async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate("branch");
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete report" });
  }
});

module.exports = router;
