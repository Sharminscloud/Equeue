const Branch = require("../models/Branch");
const Token = require("../models/Token");

async function compareBranchLoad(req, res) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const branches = await Branch.find().sort({ name: 1 });

    const result = [];

    for (const branch of branches) {
      const waitingCount = await Token.countDocuments({
        branch: branch._id,
        preferredDate: date,
        status: "Waiting",
      });

      result.push({
        branchId: branch._id,
        branchName: branch.name,
        status: branch.status,
        activeCounters: branch.activeCounters,
        dailyCapacity: branch.dailyCapacity,
        waitingCount,
        loadPercentage:
          branch.dailyCapacity > 0
            ? Math.round((waitingCount / branch.dailyCapacity) * 100)
            : 0,
      });
    }

    res.status(200).json({
      date,
      branches: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Branch load comparison failed",
      error: error.message,
    });
  }
}

async function getLeastCrowdedBranch(req, res) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const branches = await Branch.find({ status: "Active" });

    let leastCrowded = null;

    for (const branch of branches) {
      const waitingCount = await Token.countDocuments({
        branch: branch._id,
        preferredDate: date,
        status: "Waiting",
      });

      const current = {
        branchId: branch._id,
        branchName: branch.name,
        waitingCount,
        dailyCapacity: branch.dailyCapacity,
      };

      if (!leastCrowded || current.waitingCount < leastCrowded.waitingCount) {
        leastCrowded = current;
      }
    }

    res.status(200).json({
      date,
      leastCrowded,
    });
  } catch (error) {
    res.status(500).json({
      message: "Least crowded branch detection failed",
      error: error.message,
    });
  }
}

async function getHistoricalQueueTrends(req, res) {
  try {
    const history = await Token.aggregate([
      {
        $group: {
          _id: "$preferredDate",
          totalTokens: { $sum: 1 },
          completedTokens: {
            $sum: {
              $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
            },
          },
          waitingTokens: {
            $sum: {
              $cond: [{ $eq: ["$status", "Waiting"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      message: "Historical queue trend analytics",
      history: history.map((item) => ({
        date: item._id,
        totalTokens: item.totalTokens,
        completedTokens: item.completedTokens,
        waitingTokens: item.waitingTokens,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Historical analytics failed",
      error: error.message,
    });
  }
}

module.exports = {
  compareBranchLoad,
  getLeastCrowdedBranch,
  getHistoricalQueueTrends,
};
