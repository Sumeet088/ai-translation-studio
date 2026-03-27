const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// 🔹 Helper: split into sentences
const splitIntoSegments = (text) => {
  return text
    .replace(/\n/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);
};

exports.handleFileUpload = async (req, res) => {
  try {
    const file = req.file;
    let text = "";

    if (file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: file.path });
      text = result.value;
    } else {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    // 🔹 Split into segments
    const segments = splitIntoSegments(text);

    res.json({
      message: "File processed successfully",
      segments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing file" });
  }
};