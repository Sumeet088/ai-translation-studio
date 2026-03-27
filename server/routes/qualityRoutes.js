const express = require("express");
const router = express.Router();
const { checkQuality } = require("../controllers/qualityController");

router.post("/check", checkQuality);

module.exports = router;