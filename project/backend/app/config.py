import os
from dotenv import load_dotenv

# Load the .env located next to the backend app, even when uvicorn is launched
# from a different working directory.
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")
load_dotenv(ENV_FILE)
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
# Current stable Gemini 3 models. These can be overridden in .env.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash").strip()
GEMINI_FAST_MODEL = os.getenv("GEMINI_FAST_MODEL", "gemini-3.5-flash-lite").strip()
# Current multimodal embedding endpoint; lexical fallback keeps uploads usable
# if embeddings are unavailable or quota-limited.
GEMINI_EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2-preview").strip()
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "768"))
RAG_USE_EMBEDDINGS = os.getenv("RAG_USE_EMBEDDINGS", "false").lower() in {"1", "true", "yes", "on"}
RAG_TOP_K = int(os.getenv("RAG_TOP_K", "6"))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").strip()

DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
REPORT_DIR = os.path.join(BASE_DIR, "reports")
# The database location is configurable via the DATABASE_PATH environment
# variable so no connection details are hardcoded in source. Defaults to a
# local SQLite file for development.
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(DATA_DIR, "edureal.sqlite3")).strip()
RAG_INDEX_PATH = os.path.join(DATA_DIR, "rag_index.json")

for directory in (DATA_DIR, UPLOAD_DIR, REPORT_DIR):
    os.makedirs(directory, exist_ok=True)
