const Branch = require("../models/Branch");
const Token = require("../models/Token");
const Appointment = require("../models/Appointment");

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getBranchWaitingCount = async (branchId) => {
  const { start, end } = getTodayRange();

  return Token.countDocuments({
    branch: branchId,
    status: { $in: ["Waiting", "Serving"] },
    issuedAt: { $gte: start, $lte: end },
  });
};

const getBranchAppointmentCount = async (branchId) => {
  return Appointment.countDocuments({
    branch: branchId,
    status: { $in: ["Confirmed", "Rescheduled", "In-Progress", "Served"] },
  });
};

const buildBranchAnalytics = async (branch) => {
  const waiting = await getBranchWaitingCount(branch._id);
  const appointments = await getBranchAppointmentCount(branch._id);

  const activeCounters = Number(branch.activeCounters || 1);
  const estimatedWaitMinutes = Math.ceil((waiting * 15) / activeCounters);

  let crowdLevel = "Low";
  if (waiting >= 8) {
    crowdLevel = "High";
  } else if (waiting >= 4) {
    crowdLevel = "Medium";
  }

  return {
    branchId: branch._id,
    name: branch.name,
    address: branch.address,
    status: branch.status || "Active",
    waiting,
    appointments,
    activeCounters,
    dailyCapacity: branch.dailyCapacity || 0,
    estimatedWaitMinutes,
    crowdLevel,
  };
};

const compareBranches = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });

    const comparison = await Promise.all(
      branches.map((branch) => buildBranchAnalytics(branch))
    );

    res.json({
      success: true,
      totalBranches: comparison.length,
      comparison,
    });
  } catch (error) {
    console.error("Compare branches error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to compare branches",
      error: error.message,
    });
  }
};

const leastCrowdedBranch = async (req, res) => {
  try {
    const branches = await Branch.find({
      status: { $ne: "Inactive" },
    }).sort({ name: 1 });

    const analytics = await Promise.all(
      branches.map((branch) => buildBranchAnalytics(branch))
    );

    const sorted = analytics.sort((a, b) => {
      if (a.waiting !== b.waiting) {
        return a.waiting - b.waiting;
      }

      return a.estimatedWaitMinutes - b.estimatedWaitMinutes;
    });

    const leastCrowded = sorted[0] || null;

    res.json({
      success: true,
      leastCrowded,
      allBranches: sorted,
    });
  } catch (error) {
    console.error("Least crowded branch error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to find least crowded branch",
      error: error.message,
    });
  }
};

module.exports = {
  compareBranches,
  leastCrowdedBranch,
};
