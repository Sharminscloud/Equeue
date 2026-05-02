const express = require("express");
const router = express.Router();

const { createToken } = require("../controllers/tokenController");

const {
  getQueueTokens,
  updateTokenStatus,
} = require("../controllers/queueController");

router.get("/tokens", getQueueTokens);
router.post("/tokens", createToken);
router.patch("/tokens/:id/status", updateTokenStatus);

module.exports = router;
