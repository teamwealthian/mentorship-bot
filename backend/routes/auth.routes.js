const express = require("express");

const {
  bootstrap,
  createAdmin,
  getAuthBootstrapStatus,
  getCurrentAdmin,
  login
} = require("../controllers/auth.controller");
const { requireAdminAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/bootstrap-status", getAuthBootstrapStatus);
router.post("/bootstrap", bootstrap);
router.post("/login", login);
router.get("/me", requireAdminAuth, getCurrentAdmin);
router.post("/admin-users", requireAdminAuth, createAdmin);

module.exports = router;
