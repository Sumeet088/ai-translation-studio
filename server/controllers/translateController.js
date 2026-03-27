const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);

const languageMap = {
  fr: "French",
  es: "Spanish",
  de: "German",
  ja: "Japanese",
};

exports.translateText = async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    const targetLanguage = languageMap[targetLang] || "French";

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Translate the following sentence into ${targetLanguage}.

Rules:
- Keep the meaning accurate
- Preserve punctuation
- Do not explain
- Return only translated sentence

Sentence:
"${text}"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    res.json({
      source: text,
      targetLang,
      translatedText,
    });
  } catch (error) {
    console.error("TRANSLATION ERROR:", error.message);
    res.status(500).json({ message: "Translation failed" });
  }
};