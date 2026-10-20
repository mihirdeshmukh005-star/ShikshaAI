# EduReal AI — Python AI Backend

This backend is built specifically around the uploaded EduReal AI React frontend.

## Architecture

React -> FastAPI -> Gemini
                 |
                 +-> RAG: PDF -> chunks -> Gemini embeddings -> local vector index
                 |
                 +-> SQLite: students, sessions, messages, progress
                 |
                 +-> Adaptive teaching/evaluation

### Why no model training is included

For this product, training a new LLM from scratch is unnecessary and would be a poor use of a free API budget.
The system uses a strong Gemini model as the reasoning engine and adds:
1. a teaching system prompt,
2. structured AI decisions,
3. retrieval-augmented course context,
4. student progress/misconception memory,
5. adaptive teaching actions.

Fine-tuning can be considered later if you collect a high-quality, consented dataset of teaching interactions.

## Setup

Python 3.10+ recommended.

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS/Termux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Put your Gemini key in `.env`:

```env
GEMINI_API_KEY=...
```

Then run:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs:
- http://localhost:8000/docs

## Frontend

From the project root:

```bash
npm install
npm run dev
```

Optional frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

If React is opened from another device, replace `localhost` with the machine's LAN IP and set `FRONTEND_ORIGIN` accordingly.

## Main endpoints

- `GET /api/health`
- `POST /api/students`
- `POST /api/sessions/start`
- `POST /api/teacher/teach`
- `POST /api/assessment/evaluate`
- `POST /api/lessons/create`
- `POST /api/documents/upload`
- `GET /api/rag/status`
- `GET /api/students/{student_id}/progress`

## RAG workflow

1. Upload a PDF to `/api/documents/upload`.
2. Text is extracted with PyMuPDF/PyPDF.
3. Text is split into overlapping chunks.
4. Gemini embeddings are generated.
5. Embeddings and metadata are stored in `data/rag_index.json`.
6. A student question is embedded.
7. Cosine similarity plus a small lexical-overlap signal reranks the chunks.
8. Top chunks are inserted into the teacher prompt.
9. Gemini answers using the retrieved course context.

This is an educational MVP RAG implementation. For production scale, replace the JSON index with PostgreSQL + pgvector, Qdrant, Pinecone, or another vector database.

## Important security

Never put `GEMINI_API_KEY` in the React app or commit `.env`.
The browser calls FastAPI; only FastAPI calls Gemini.

## About "any question"

The teacher prompt is designed to adapt from beginner to postgraduate/research-style questions. It does not guarantee that every answer is correct. For high-stakes or frontier questions, the system should communicate uncertainty and use trusted sources/RAG rather than pretending to know.
