const express = require("express");
const router = express.Router();

const {
  getTokens,
  createToken,
  deleteToken,
} = require("../controllers/tokenController");

router.get("/", getTokens);
router.post("/", createToken);
router.delete("/:id", deleteToken);

module.exports = router;
