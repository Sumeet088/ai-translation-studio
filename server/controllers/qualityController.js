const axios = require("axios");

// Map severity
const getSeverity = (ruleId) => {
  if (ruleId.includes("SPELL")) return "HIGH";
  if (ruleId.includes("GRAMMAR")) return "MEDIUM";
  return "LOW";
};

exports.checkQuality = async (req, res) => {
  try {
    const { text } = req.body;

    const response = await axios.post(
      "https://api.languagetool.org/v2/check",
      new URLSearchParams({
        text: text,
        language: "en-US",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const matches = response.data.matches;

    const issues = matches.map((match) => ({
      message: match.message,
      offset: match.offset,
      length: match.length,
      replacements: match.replacements.map((r) => r.value),
      severity: getSeverity(match.rule.id),
    }));

    res.json({ issues });
  } catch (error) {
  console.error("FULL ERROR:", error.response?.data || error.message);
  res.status(500).json({ message: "Error checking quality" });
  }
};