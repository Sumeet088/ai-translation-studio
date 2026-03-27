from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import chromadb

app = FastAPI()

model = SentenceTransformer("all-MiniLM-L6-v2")

# Chroma setup
client = chromadb.Client()
collection = client.get_or_create_collection(name="translations")

class TextInput(BaseModel):
    text: str

class StoreInput(BaseModel):
    source: str
    target: str

# 🔹 Generate embedding
@app.post("/embed")
def embed_text(input: TextInput):
    embedding = model.encode(input.text).tolist()
    return {"embedding": embedding}

# 🔹 Store translation
@app.post("/store")
def store_translation(data: StoreInput):
    embedding = model.encode(data.source).tolist()

    collection.add(
        documents=[data.source],
        embeddings=[embedding],
        metadatas=[{"target": data.target}],
        ids=[data.source]
    )

    return {"message": "Stored"}

# 🔹 Search similar
@app.post("/search")
def search(data: TextInput):
    embedding = model.encode(data.text).tolist()

    results = collection.query(
        query_embeddings=[embedding],
        n_results=1
    )

    return results