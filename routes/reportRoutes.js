const express = require("express");
const router = express.Router();

const {
  generateReport,
  saveReport,
  getReports,
  deleteReport,
} = require("../controllers/reportController");

router.get("/generate", generateReport);
router.post("/save", saveReport);
router.get("/", getReports);
router.delete("/:id", deleteReport);

module.exports = router;
