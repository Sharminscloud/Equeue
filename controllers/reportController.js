const Report = require("../models/Report");
const Token = require("../models/Token");
const Appointment = require("../models/Appointment");

async function calculateReportMetrics(startDate, endDate, branchId) {
  const tokenFilter = {
    preferredDate: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  const appointmentFilter = {
    preferredDate: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  if (branchId) {
    tokenFilter.branch = branchId;
    appointmentFilter.branch = branchId;
  }

  const tokens = await Token.find(tokenFilter);
  const appointments = await Appointment.find(appointmentFilter);

  const completedTokens = tokens.filter(
    (token) => token.status === "Completed",
  );

  const totalWaitingTime = tokens.reduce(
    (sum, token) => sum + (token.estimatedWaitingTime || 0),
    0,
  );

  const averageWaitingTime =
    tokens.length > 0 ? Math.round(totalWaitingTime / tokens.length) : 0;

  const completionRate =
    tokens.length > 0
      ? Math.round((completedTokens.length / tokens.length) * 100)
      : 0;

  const queuePerformanceScore = Math.max(0, Math.min(100, completionRate));

  return {
    totalTokens: tokens.length,
    totalUsersServed: completedTokens.length,
    totalAppointments: appointments.length,
    averageWaitingTime,
    queuePerformanceScore,
  };
}

async function generateReport(req, res) {
  try {
    const { startDate, endDate, branchId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "startDate and endDate are required",
      });
    }

    const metrics = await calculateReportMetrics(startDate, endDate, branchId);

    res.status(200).json({
      reportName: `Operational Report ${startDate} to ${endDate}`,
      startDate,
      endDate,
      branchId: branchId || null,
      metrics,
    });
  } catch (error) {
    res.status(500).json({
      message: "Report generation failed",
      error: error.message,
    });
  }
}

async function saveReport(req, res) {
  try {
    const { reportName, startDate, endDate, branchId } = req.body;

    if (!reportName || !startDate || !endDate) {
      return res.status(400).json({
        message: "reportName, startDate, and endDate are required",
      });
    }

    const metrics = await calculateReportMetrics(startDate, endDate, branchId);

    const report = await Report.create({
      reportName,
      startDate,
      endDate,
      branch: branchId || null,
      metrics,
    });

    res.status(201).json({
      message: "Report saved successfully",
      report,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to save report",
      error: error.message,
    });
  }
}

async function getReports(req, res) {
  try {
    const reports = await Report.find()
      .populate("branch")
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
}

async function deleteReport(req, res) {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.status(200).json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete report",
      error: error.message,
    });
  }
}

module.exports = {
  generateReport,
  saveReport,
  getReports,
  deleteReport,
};
