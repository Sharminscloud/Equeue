const Branch = require("../models/Branch");
const Service = require("../models/Service");
const { calculateFeasibleCapacity } = require("./branchController");

async function estimateWaitingTime(req, res) {
  try {
    const { branchId } = req.params;
    const waitingPeople = Number(req.query.waitingPeople) || 0;
    const averageServiceTime = Number(req.query.averageServiceTime) || 15;

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    if (branch.status !== "Active") {
      return res.status(400).json({
        message: `Waiting time cannot be estimated because branch is ${branch.status}`,
        branchStatus: branch.status,
      });
    }

    const estimatedWaitingTime = Math.ceil(
      (waitingPeople / branch.activeCounters) * averageServiceTime,
    );

    res.status(200).json({
      branchId,
      branchName: branch.name,
      waitingPeople,
      activeCounters: branch.activeCounters,
      averageServiceTime,
      estimatedWaitingTime,
      message: `Estimated waiting time is ${estimatedWaitingTime} minutes`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to estimate waiting time",
      error: error.message,
    });
  }
}

async function checkCapacity(req, res) {
  try {
    const { branchId, serviceId, dailyCapacity, averageServiceTime } =
      req.query;

    if (!branchId) {
      return res.status(400).json({
        message: "branchId is required",
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    let processingTime = Number(averageServiceTime) || 15;

    if (serviceId) {
      const service = await Service.findById(serviceId);

      if (service) {
        processingTime = service.averageProcessingTime;
      }
    }

    const enteredDailyCapacity = Number(dailyCapacity) || branch.dailyCapacity;
    const feasibleCapacity = calculateFeasibleCapacity(branch, processingTime);

    res.status(200).json({
      branchName: branch.name,
      activeCounters: branch.activeCounters,
      workingHours: branch.workingHours,
      averageServiceTime: processingTime,
      feasibleCapacity,
      enteredDailyCapacity,
      isRealistic: enteredDailyCapacity <= feasibleCapacity,
      warning:
        enteredDailyCapacity > feasibleCapacity
          ? "Entered daily capacity is higher than realistic capacity"
          : "",
    });
  } catch (error) {
    res.status(500).json({
      message: "Capacity check failed",
      error: error.message,
    });
  }
}

module.exports = {
  estimateWaitingTime,
  checkCapacity,
};
