import { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [segments, setSegments] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  const [issues, setIssues] = useState([]);
  const [tmResult, setTmResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState("fr");
  const [translation, setTranslation] = useState("");
  const [editableTranslation, setEditableTranslation] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [translationSource, setTranslationSource] = useState(""); // TM or Gemini

  const languageMap = {
    fr: "French",
    es: "Spanish",
    de: "German",
    ja: "Japanese",
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/files/upload",
        formData
      );

      setSegments(res.data.segments || []);
      setSelectedText("");
      setIssues([]);
      setTmResult(null);
      setTranslation("");
      setEditableTranslation("");
      setSaveMessage("");
      setTranslationSource("");
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed");
    }
  };

  const analyzeSegment = async (text) => {
    try {
      setLoading(true);
      setSelectedText(text);
      setIssues([]);
      setTmResult(null);
      setTranslation("");
      setEditableTranslation("");
      setSaveMessage("");
      setTranslationSource("");

      console.log("Clicked segment:", text);

      // Step 1: Quality + TM Search
      const [qualityRes, tmRes] = await Promise.all([
        axios.post("http://localhost:5000/api/quality/check", { text }),
        axios.post("http://localhost:5000/api/tm/search", {
          text,
          targetLang,
        }),
      ]);

      console.log("QUALITY RESPONSE:", qualityRes.data);
      console.log("TM RESPONSE:", tmRes.data);

      setIssues(qualityRes.data.issues || []);
      setTmResult(tmRes.data || null);

      // Step 2: Decide whether to use TM or Gemini
      const hasStrongTMMatch =
        tmRes.data?.match && tmRes.data?.score !== null && tmRes.data?.score <= 0.4;

      if (hasStrongTMMatch) {
        console.log("Using TM translation");
        setTranslation(tmRes.data.match.target);
        setEditableTranslation(tmRes.data.match.target);
        setTranslationSource("TM");
      } else {
        console.log("Using Gemini translation");

        try {
          const translateRes = await axios.post(
            "http://localhost:5000/api/translate",
            {
              text,
              targetLang,
            }
          );

          console.log("TRANSLATE RESPONSE:", translateRes.data);

          const translated = translateRes.data.translatedText || "";

          setTranslation(translated);
          setEditableTranslation(translated);
          setTranslationSource("Gemini");
        } catch (err) {
          console.error("TRANSLATE ERROR:", err.response?.data || err.message);

          if (err.response?.status === 429) {
            setTranslation("⏳ Rate limit exceeded. Please wait 20–30 seconds and try again.");
            setEditableTranslation(
              "⏳ Rate limit exceeded. Please wait 20–30 seconds and try again."
            );
          } else {
            setTranslation("❌ Translation failed");
            setEditableTranslation("❌ Translation failed");
          }

          setTranslationSource("Error");
        }
      }
    } catch (err) {
      console.error("ANALYZE ERROR:", err.response?.data || err.message);
      alert("Error analyzing segment");
    } finally {
      setLoading(false);
    }
  };

  const saveToTM = async () => {
    try {
      if (!selectedText || !editableTranslation) {
        return alert("Nothing to save");
      }

      const res = await axios.post("http://localhost:5000/api/tm/add", {
        source: selectedText,
        target: editableTranslation,
        targetLang,
      });

      console.log("SAVE RESPONSE:", res.data);
      setSaveMessage("✅ Translation approved and saved to Translation Memory!");
    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err.message);
      alert("Error saving translation");
    }
  };

  const highlightText = (text, issues) => {
    if (!text) return "";
    if (!issues.length) return text;

    const sorted = [...issues].sort((a, b) => a.offset - b.offset);

    let elements = [];
    let lastIndex = 0;

    sorted.forEach((issue, index) => {
      const start = issue.offset;
      const end = start + issue.length;

      if (start < lastIndex) return;

      if (start > lastIndex) {
        elements.push(text.substring(lastIndex, start));
      }

      elements.push(
        <span
          key={index}
          style={{
            backgroundColor:
              issue.severity === "HIGH"
                ? "#ef4444"
                : issue.severity === "MEDIUM"
                ? "#f97316"
                : "#eab308",
            color: "white",
            padding: "2px 6px",
            borderRadius: "6px",
            margin: "0 2px",
            fontWeight: "500",
          }}
          title={`${issue.message} | Suggestions: ${issue.replacements?.join(", ")}`}
        >
          {text.substring(start, end)}
        </span>
      );

      lastIndex = end;
    });

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements;
  };

  const getMatchLabel = (score) => {
    if (score === null || score === undefined) return "No score";
    if (score <= 0.1) return "Exact / Very Strong Match";
    if (score <= 0.3) return "Strong Fuzzy Match";
    if (score <= 0.6) return "Weak Fuzzy Match";
    return "Probably New Segment";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1150px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            marginBottom: "24px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "32px", color: "#0f172a" }}>
            AI Translation Studio
          </h1>
          <p style={{ color: "#475569", marginTop: "8px" }}>
            Upload documents, validate source quality, retrieve translation memory,
            and generate AI-powered translations.
          </p>
        </div>

        {/* Controls */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            marginBottom: "24px",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{
              padding: "10px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              background: "#f8fafc",
            }}
          />

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "white",
              fontSize: "15px",
            }}
          >
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
          </select>

          <button
            onClick={handleUpload}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            Upload & Parse
          </button>

          <div
            style={{
              marginLeft: "auto",
              background: "#eff6ff",
              color: "#1d4ed8",
              padding: "10px 14px",
              borderRadius: "12px",
              fontWeight: "600",
            }}
          >
            Target Language: {languageMap[targetLang]}
          </div>
        </div>

        {/* Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          {/* Left Panel */}
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              minHeight: "500px",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#0f172a" }}>Extracted Segments</h2>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>
              Click any segment to analyze quality, retrieve TM, and generate translation.
            </p>

            {segments.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>
                No segments yet. Upload a document to begin.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {segments.map((seg, i) => (
                  <li
                    key={i}
                    onClick={() => analyzeSegment(seg)}
                    style={{
                      cursor: "pointer",
                      marginBottom: "12px",
                      padding: "14px 16px",
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      background: selectedText === seg ? "#eff6ff" : "#f8fafc",
                      transition: "0.2s",
                    }}
                  >
                    {seg}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right Panel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Selected Sentence */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#0f172a" }}>Selected Sentence</h2>
              {loading ? (
                <p style={{ color: "#2563eb", fontWeight: "600" }}>Analyzing segment...</p>
              ) : selectedText ? (
                <p style={{ fontSize: "18px", lineHeight: "1.9", color: "#1e293b" }}>
                  {highlightText(selectedText, issues)}
                </p>
              ) : (
                <p style={{ color: "#94a3b8" }}>Select a segment to analyze.</p>
              )}
            </div>

            {/* Quality Issues */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#0f172a" }}>Quality Issues</h2>
              {issues.length === 0 ? (
                <p style={{ color: "#16a34a", fontWeight: "600" }}>
                  No issues found 🎉
                </p>
              ) : (
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                  {issues.map((issue, i) => (
                    <li key={i} style={{ marginBottom: "12px", color: "#334155" }}>
                      <strong>{issue.severity}</strong> — {issue.message}
                      <br />
                      <span style={{ color: "#64748b" }}>
                        Suggestions: {issue.replacements?.join(", ") || "No suggestions"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* TM Suggestion */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#0f172a" }}>Translation Memory Suggestion</h2>
              {!tmResult?.match ? (
                <p style={{ color: "#94a3b8" }}>No similar translation found yet.</p>
              ) : (
                <div
                  style={{
                    border: "1px solid #dbeafe",
                    background: "#eff6ff",
                    borderRadius: "16px",
                    padding: "18px",
                  }}
                >
                  <p><strong>Matched Source:</strong> {tmResult.match.source}</p>
                  <p><strong>Suggested Translation:</strong> {tmResult.match.target}</p>
                  <p><strong>Match Quality:</strong> {getMatchLabel(tmResult.score)}</p>
                  <p><strong>Distance Score:</strong> {tmResult.score ?? "N/A"}</p>
                </div>
              )}
            </div>

            {/* AI Translation Output */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#0f172a" }}>AI Translation Output</h2>

              {editableTranslation ? (
                <>
                  <div
                    style={{
                      marginBottom: "12px",
                      display: "inline-block",
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background:
                        translationSource === "TM"
                          ? "#c1c9ce"
                          : translationSource === "Gemini"
                          ? "#dcfce7"
                          : "#fee2e2",
                      color:
                        translationSource === "TM"
                          ? "#1d4ed8"
                          : translationSource === "Gemini"
                          ? "#166534"
                          : "#b91c1c",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Source: {translationSource || "Unknown"}
                  </div>

                  <textarea
  value={editableTranslation}
  onChange={(e) => setEditableTranslation(e.target.value)}
  rows={5}
  style={{
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid #94a3b8",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "16px",
    lineHeight: "1.7",
    resize: "vertical",
    outline: "none",
    fontWeight: "500",
  }}
/>

                  <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                    <button
                      onClick={saveToTM}
                      style={{
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "15px",
                      }}
                    >
                      Approve & Save to TM
                    </button>

                    <button
                      onClick={() => navigator.clipboard.writeText(editableTranslation)}
                      style={{
                        background: "#0ea5e9",
                        color: "white",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "15px",
                      }}
                    >
                      Copy Translation
                    </button>
                  </div>

                  {saveMessage && (
                    <p style={{ marginTop: "14px", color: "#16a34a", fontWeight: "600" }}>
                      {saveMessage}
                    </p>
                  )}
                </>
              ) : (
                <p style={{ color: "#94a3b8" }}>
                  No translation generated yet. Click a segment to translate.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;