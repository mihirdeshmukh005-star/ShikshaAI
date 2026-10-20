# AI Integration Notes — Fixed Build

The backend uses the Google `google-genai` SDK. Normal teaching uses structured `models.generate_content` without tools/AFC. The configured model is tried first; model-unavailable errors can fall back to current stable Flash models, while 401/429 errors are reported clearly.

RAG is hybrid:
1. Parse uploaded material into page/slide-aware chunks.
2. Persist chunks locally.
3. Batch-create semantic embeddings when the configured embedding endpoint is available.
4. Always retain lexical retrieval as a fallback.
5. Use semantic retrieval only when lexical evidence is weak, reducing latency and unnecessary API calls.
6. Ground teacher prompts in retrieved material.

Report generation happens only when the lesson is completed. The PDF includes detailed concept sections, examples, formulas, questions and answers, diagrams/visual representations, final summary, suggested study items and blackboard history.
