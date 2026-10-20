# EduReal AI — Fast AI Classroom (Auth + Fast RAG + Lesson Reports)

## What was fixed

- Gemini configuration now defaults to current stable `gemini-3.6-flash`.
- Fast model defaults to `gemini-3.5-flash-lite`.
- Gemini Embedding 2 uses `gemini-embedding-2-preview`.
- Model fallback handles a fresh API key whose configured model is unavailable; quota/authentication errors are surfaced instead of being hidden.
- No automatic function-calling/tools are configured for ordinary classroom generation, avoiding the AFC warning for these calls.
- `.env` is loaded from `backend/.env` reliably.
- Hybrid RAG: local lexical retrieval is always available; semantic embedding retrieval is used when lexical evidence is weak.
- Upload indexing batches embedding requests where supported, reducing API calls.
- PDF/DOCX/PPTX/TXT/MD/CSV/JSON materials are supported.
- Uploaded material is retrieved as primary classroom context when relevant.
- Missing/failed embeddings no longer make a material upload unusable.
- Teaching, doubt and assessment requests have longer client timeouts; normal teaching remains a single structured Gemini generation per turn.
- Completed lessons generate a structured PDF with detailed concept explanations, real-life examples, formulas, visual descriptions/diagrams, theoretical questions + answers, numerical/application questions + worked answers, summary, suggestions and recorded blackboard history.
- If the final report generation call fails, a non-empty fallback report is built from recorded lesson content instead of producing a blank PDF.
- PDF export remains locked until the live lesson is completed.

## Gemini setup

Create `backend/.env`:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FAST_MODEL=gemini-3.5-flash-lite
GEMINI_EMBEDDING_MODEL=gemini-embedding-2-preview
RAG_USE_EMBEDDINGS=true
RAG_TOP_K=6
EMBEDDING_DIM=768
FRONTEND_ORIGIN=http://localhost:5173
```

Never commit a real API key.

## Backend

```bash
cd ~/Prototype/project/backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
nano .env
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Test:

```bash
curl http://localhost:8000/
curl http://localhost:8000/api/health
```

## Frontend

In another terminal:

```bash
cd ~/Prototype/project/frontend
npm install
npm run dev -- --host 0.0.0.0
```

Open the Vite address shown in the terminal.

## Quick Gemini test

```bash
cd ~/Prototype/project/backend
source .venv/bin/activate
python -c "from google import genai; import os; from dotenv import load_dotenv; load_dotenv(); c=genai.Client(api_key=os.getenv('GEMINI_API_KEY')); r=c.models.generate_content(model=os.getenv('GEMINI_MODEL','gemini-3.6-flash'), contents='Say OK'); print(r.text)"
```

## Notes

The ZIP intentionally does not include `node_modules`, a real `.env`, or a real API key. Run `npm install` and create `backend/.env` locally.


## This upgraded build

### 1. Faster lesson start
- Session creation now prefetches the first teaching segment in the same API request.
- The frontend no longer performs the old sequential `start session -> wait -> call teacher` flow.
- RAG uses fast local lexical retrieval first and only requests embeddings when the lexical signal is weak.
- The first blackboard state and teacher speech arrive together.

### 2. Strict single-language classroom
- Only **English** and **Hindi** are available.
- The selected language is locked for the complete teacher response.
- English lessons contain English explanatory text only.
- Hindi lessons contain Hindi explanatory text only.
- The teacher prompt explicitly performs a language consistency check before returning content.
- Browser speech uses `en-IN` or `hi-IN` according to the selected language.

### 3. Teacher movement
- The supplied `teacher.glb` is rendered with continuous idle movement.
- While speaking, the teacher gets a subtle additional nod/sway animation.
- No fake mouth/bone animation is invented when the GLB has no facial rig.

### 4. Sign in / Sign up / Log out
- New `/login` page.
- Registration automatically creates an authenticated session.
- Authentication uses an opaque token stored in the SQLite database, not a password in browser storage.
- Protected classroom/session/report/upload APIs require `Authorization: Bearer <token>`.
- Logout is available from the desktop profile and the classroom header for mobile.

### 5. Proper database
The application database is SQLite at `backend/data/edureal.sqlite3` by default and stores:
- users
- authentication tokens
- students
- lessons/sessions
- teacher/student messages
- learning progress

You can replace SQLite with another database later through the storage layer. The password is stored only as a PBKDF2 hash.

### 6. Fast report generation after End Class
Clicking **End Class**, or letting the timer finish, completes the lesson and immediately builds the PDF from the recorded class data without making another Gemini call. The report contains:
- every recorded concept
- a brief explanation for every concept
- real-life/application context
- formulas
- educational diagrams
- topic-based theoretical questions and answers
- blackboard record
- questions asked during class
- final summary
- suggested next study

The PDF is generated before the Export button is unlocked, so the user never gets a broken/empty report link.

## Important
Create `backend/.env` with your own API key. Never commit it.

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FAST_MODEL=gemini-3.5-flash-lite
GEMINI_EMBEDDING_MODEL=gemini-embedding-2-preview
RAG_USE_EMBEDDINGS=true
RAG_TOP_K=6
EMBEDDING_DIM=768
FRONTEND_ORIGIN=http://localhost:5173
```

If your Gemini account exposes different model names, change the three model variables; the backend is designed to surface authentication/quota errors instead of silently returning fake answers.
