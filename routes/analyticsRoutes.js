const express = require("express");
const router = express.Router();

const {
  compareBranchLoad,
  getLeastCrowdedBranch,
  getHistoricalQueueTrends,
} = require("../controllers/analyticsController");

router.get("/compare", compareBranchLoad);
router.get("/least-crowded", getLeastCrowdedBranch);
router.get("/history", getHistoricalQueueTrends);

module.exports = router;
