const express = require("express");
const router = express.Router();

const {
  getAvailability,
  searchSlots,
} = require("../controllers/slotController");

router.get("/availability", getAvailability);
router.get("/search", searchSlots);

module.exports = router;
