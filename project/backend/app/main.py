from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import FRONTEND_ORIGIN, GEMINI_MODEL, GEMINI_FAST_MODEL, GEMINI_EMBEDDING_MODEL, GEMINI_API_KEY
from .db import init_db
from .api.routes import router

init_db()

app = FastAPI(
    title="EduReal AI Backend",
    description="Adaptive AI teacher backend with Gemini, local RAG, student progress and assessment.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "message": "EduReal AI backend is running",
        "docs": "/docs",
        "ai": "Gemini",
        "models": {
            "primary": GEMINI_MODEL,
            "fast": GEMINI_FAST_MODEL,
            "embedding": GEMINI_EMBEDDING_MODEL,
        },
        "api_key_configured": bool(GEMINI_API_KEY),
        "rag": "Hybrid semantic + lexical retrieval with embedding fallback",
    }
