const Branch = require("../models/Branch");

const DEFAULT_AVG_SERVICE_TIME = 15;

const getWaitingTime = async (req, res) => {
  try {
    const { branchId } = req.params;
    const date = req.query.date || new Date().toISOString().split("T")[0];
    const waitingPeople = Number(req.query.waitingPeople || 0);

    if (Number.isNaN(waitingPeople) || waitingPeople < 0) {
      return res.status(400).json({
        message: "waitingPeople must be a valid non-negative number",
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    if (branch.status === "Inactive" || branch.status === "Maintenance") {
      return res.status(400).json({
        message: `Branch is ${branch.status}. Waiting time cannot be estimated.`,
      });
    }

    const counters = branch.activeCounters || 1;

    const estimatedMinutes =
      waitingPeople === 0
        ? 0
        : Math.ceil((waitingPeople / counters) * DEFAULT_AVG_SERVICE_TIME);

    res.json({
      branchName: branch.name,
      date,
      waitingPeople,
      activeCounters: counters,
      averageServiceTimeMinutes: DEFAULT_AVG_SERVICE_TIME,
      estimatedWaitMinutes: estimatedMinutes,
      message: "Waiting time estimated successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to calculate waiting time",
      error: err.message,
    });
  }
};

module.exports = { getWaitingTime };
