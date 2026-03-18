const express = require("express");

const { addKnowledge } = require("../controllers/admin.controller");

const router = express.Router();

router.post("/add-knowledge", addKnowledge);

module.exports = router;
