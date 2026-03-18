const express = require("express");

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
