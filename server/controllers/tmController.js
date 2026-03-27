const axios = require("axios");

// Add translation to AI vector DB
exports.addTranslation = async (req, res) => {
  try {
    const { source, target } = req.body;

    const response = await axios.post("http://127.0.0.1:8000/store", {
      source,
      target,
    });

    res.json({
      message: "Stored in AI Translation Memory",
      data: response.data,
    });
  } catch (error) {
    console.error("TM STORE ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: "Error storing translation" });
  }
};

// Search similar translation from AI vector DB
exports.searchTranslation = async (req, res) => {
  try {
    const { text } = req.body;

    const response = await axios.post("http://127.0.0.1:8000/search", {
      text,
    });

    const results = response.data;

    // extract best match safely
    const bestSource = results.documents?.[0]?.[0] || null;
    const bestTarget = results.metadatas?.[0]?.[0]?.target || null;
    const score = results.distances?.[0]?.[0] ?? null;

    res.json({
      match: bestSource
        ? {
            source: bestSource,
            target: bestTarget,
          }
        : null,
      score,
      raw: results,
    });
  } catch (error) {
    console.error("TM SEARCH ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: "Error searching translation memory" });
  }
};