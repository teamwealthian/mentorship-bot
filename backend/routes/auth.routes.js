const express = require("express");

const { getCurrentAdmin, login } = require("../controllers/auth.controller");
const { requireAdminAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", login);
router.get("/me", requireAdminAuth, getCurrentAdmin);

module.exports = router;
