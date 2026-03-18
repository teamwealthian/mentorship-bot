const express = require("express");

const chatRoutes = require("./chat.routes");
const healthRoutes = require("./health.routes");

const router = express.Router();

router.use("/chat", chatRoutes);
router.use("/health", healthRoutes);

module.exports = router;
