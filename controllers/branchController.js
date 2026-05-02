const Branch = require("../models/Branch");

function getMinutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function calculateFeasibleCapacity(branch, averageProcessingTime = 15) {
  const openMinutes = getMinutes(branch.workingHours.open);
  const closeMinutes = getMinutes(branch.workingHours.close);
  const totalWorkingMinutes = Math.max(closeMinutes - openMinutes, 0);

  return Math.floor(
    (totalWorkingMinutes * branch.activeCounters) / averageProcessingTime,
  );
}

async function getBranches(req, res) {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (status) {
      filter.status = status;
    }

    const branches = await Branch.find(filter).sort({ createdAt: -1 });
    res.status(200).json(branches);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch branches",
      error: error.message,
    });
  }
}

async function createBranch(req, res) {
  try {
    const branch = await Branch.create(req.body);
    const averageProcessingTime = Number(req.body.averageProcessingTime) || 15;
    const feasibleCapacity = calculateFeasibleCapacity(
      branch,
      averageProcessingTime,
    );

    res.status(201).json({
      message: "Branch created successfully",
      branch,
      capacityCheck: {
        averageProcessingTime,
        feasibleCapacity,
        enteredDailyCapacity: branch.dailyCapacity,
        isRealistic: branch.dailyCapacity <= feasibleCapacity,
        warning:
          branch.dailyCapacity > feasibleCapacity
            ? "Entered daily capacity is higher than feasible capacity"
            : "",
      },
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create branch",
      error: error.message,
    });
  }
}

async function updateBranch(req, res) {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    res.status(200).json({
      message: "Branch updated successfully",
      branch,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update branch",
      error: error.message,
    });
  }
}

async function deleteBranch(req, res) {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    res.status(200).json({
      message: "Branch deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete branch",
      error: error.message,
    });
  }
}

module.exports = {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  calculateFeasibleCapacity,
};
