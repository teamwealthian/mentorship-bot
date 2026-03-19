const express = require("express");

const adminRoutes = require("./admin.routes");
const authRoutes = require("./auth.routes");
const chatRoutes = require("./chat.routes");
const healthRoutes = require("./health.routes");

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/health", healthRoutes);

module.exports = router;
