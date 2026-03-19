const express = require("express");

const { addKnowledge } = require("../controllers/admin.controller");
const { requireAdminAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(requireAdminAuth);
router.post("/add-knowledge", addKnowledge);

module.exports = router;
