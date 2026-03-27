const express = require("express");
const router = express.Router();
const {
  addTranslation,
  searchTranslation,
} = require("../controllers/tmController");

router.post("/add", addTranslation);
router.post("/search", searchTranslation);

module.exports = router;