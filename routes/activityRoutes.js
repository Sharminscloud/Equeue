const express = require("express");
const router = express.Router();

const { getActivityByEmail } = require("../controllers/activityController");

router.get("/", getActivityByEmail);

module.exports = router;
