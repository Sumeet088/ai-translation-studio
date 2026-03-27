# AI Translation Studio

An AI-powered translation workflow platform that helps linguists and teams translate documents faster and more consistently by combining:

- **Document parsing**
- **Source quality validation**
- **Translation Memory (TM)**
- **Semantic retrieval (RAG)**
- **LLM-based translation fallback**
- **Human review and approval workflow**

This project is built as a **personal end-to-end AI/NLP system** to simulate a modern enterprise translation studio.

---

## 🚀 Features

### 1) Upload & Parse Documents
- Upload **PDF** and **DOCX** files
- Extract text content and split it into sentence-level segments

### 2) Source Quality Validation
- Detect grammar / spelling / punctuation issues
- Highlight issues visually with severity labels
- Show suggested corrections

### 3) Translation Memory (TM)
- Store approved **source → target** translation pairs
- Reuse previous translations instead of re-translating

### 4) Semantic Retrieval (RAG)
- Convert source sentences into **embeddings**
- Search semantically similar past translations using **ChromaDB**
- Retrieve fuzzy matches even when wording changes

### 5) LLM Translation Fallback
- If no strong TM match exists, the system uses **Gemini API**
- Supports multiple target languages (currently UI-supported):
  - French
  - Spanish
  - German
  - Japanese

### 6) Human-in-the-Loop Approval
- Users can review/edit AI-generated translation
- Approve final translation and save it back into TM
- Creates a continuous learning workflow

---

## 🧠 Architecture

```text
Frontend (React)
      ↓
Backend (Node.js / Express)
      ↓
AI Microservice (Python / FastAPI)
      ↓
Embeddings + Vector Search (Sentence Transformers + ChromaDB)
      ↓
LLM Translation (Gemini API)


🛠️ Tech Stack

Frontend
React
Axios
Vite

Backend
Node.js
Express
Multer
Mammoth
pdf-parse
LanguageTool API
AI / NLP
Python
FastAPI
sentence-transformers
ChromaDB
LLM

Gemini API

📂 Project Structure
translation-studio/
├── client/          # React frontend
├── server/          # Node.js backend
├── ai-service/      # Python AI microservice
│   └── main.py
└── README.md

 Language selection UI


## Setup Instructions
1) Clone the repository
git clone https://github.com/Sumeet088/ai-translation-studio.git
cd ai-translation-studio

🖥️ Frontend Setup
cd client
npm install
npm run dev

Frontend runs on:

http://localhost:5173

🧩 Backend Setup
cd server
npm install
node app.js

Backend runs on:
http://localhost:5000

🤖 AI Service Setup
Create virtual environment
cd ai-service

python -m venv venv
venv\Scripts\activate

Install dependencies
pip install sentence-transformers chromadb fastapi uvicorn

Run AI service
uvicorn main:app --reload

AI service runs on:
http://127.0.0.1:8000

Swagger docs:
http://127.0.0.1:8000/docs

🔐 Environment Variables
Create a .env file inside the server/ folder:
GEMINI_API_KEY=your_api_key_here

▶️ How It Works
Workflow
Upload a PDF or DOCX file
Extract text into sentence-level segments
Click a segment to:
check source quality
search translation memory
generate AI translation if needed
Review / edit translation
Approve and save into TM
💡 Example Pipeline
Sentence clicked
   ↓
Quality Check
   ↓
Translation Memory Search
   ↓
If strong match found → reuse translation
Else → Gemini translates
   ↓
User reviews / edits
   ↓
Save approved translation to TM
🎯 Why This Project Matters

Enterprise translation workflows often suffer from:

inconsistent terminology
repeated re-translation
poor source quality
disconnected tools
no learning from approved corrections

This project is designed to solve those problems with a practical AI-assisted workflow.

📌 Current Status

Implemented
 File upload and parsing
 Source quality validation
 Highlighting UI
 Translation Memory
 Semantic retrieval with embeddings
 Gemini translation fallback
 Approval + save to TM
