const express = require("express");
const router = express.Router();

const {
  estimateWaitingTime,
  checkCapacity,
} = require("../controllers/waitingTimeController");

const { checkHoliday } = require("../controllers/holidayController");

router.get("/holiday/check", checkHoliday);
router.get("/capacity/check", checkCapacity);
router.get("/:branchId", estimateWaitingTime);

module.exports = router;
