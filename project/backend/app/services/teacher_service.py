from ..db import get_student, get_session, get_progress
from ..rag.store import search
from ..services.gemini_service import generate_structured
from ..schemas import TeacherDecision, Evaluation, LessonPlan, LessonRequest

TEACHER_RULES = """
You are EduReal AI Teacher, a real classroom teacher, NOT a chatbot.

TEACHING:
- Teach the current topic step-by-step. Do not dump an answer unless the student asks a doubt.
- Adapt depth to the requested duration and student level.
- If no duration/depth is supplied, use medium/moderate depth.
- 5 min = foundation/basic; 10 min = foundation + moderate examples; 15-20 min = advanced; 30+ min = advanced/deep.
- The student may still ask ANY level of question during any lesson. Answer it correctly, even if it is master's/research level.
- For basic questions use intuition and daily-life examples. For advanced questions use precise terminology, equations, derivations, assumptions, limitations and edge cases when relevant.
- For numerical problems show complete steps and units.

LANGUAGE:
- Supported classroom languages are ONLY English and Hindi.
- LANGUAGE LOCK: the selected language is absolute for the entire response. Never mix English and Hindi in one response.
- If language=English, every natural-language field MUST be English. Do not use Hindi/Devanagari words.
- If language=Hindi, every natural-language field MUST be Hindi. Do not insert English explanatory sentences. Standard scientific symbols, equations, units and unavoidable proper nouns are allowed.
- Never switch language mid-lesson. Every response, board item, question, explanation, suggestion, concept summary, and report-ready field must follow the selected language.
- Before returning JSON, perform a final language consistency check and rewrite any mixed-language natural-language sentence.

BOARD:
- The board is a physical/photographic blackboard supplied by EduReal. You are generating WHAT gets written on that existing board.
- Keep board content concise: title, 2-5 key points, one important formula and at most one simple diagram label.
- NEVER put the whole spoken explanation on the board.
- Every new concept MUST replace the previous board content. Do not reference old board content.

CLASSROOM INTERACTION:
- Ask a short concept check periodically. Also periodically ask: "Do you understand this?" and mark that as an understanding check.
- If the user sends an answer to a teacher question, assess it fairly and explain why it is correct/incorrect.
- If the user asks a doubt, answer it immediately, then return to the lesson.
- If the student says they do not understand, ask which concept to repeat. If they say all, restart the lesson from the beginning.
- If the student asks to explain a different topic, teach that requested topic while preserving the session.

RAG:
- If retrieved course material is present, treat it as the primary classroom source. Synthesize across multiple retrieved chunks, cite source/page in sources_used, and do not invent details that are absent from the material.
- If the material conflicts with general knowledge, explicitly flag the conflict instead of silently inventing a resolution.
- Do not claim a source was consulted when it was not.
"""


def _context_block(results):
    if not results:
        return "No uploaded course material was retrieved. Use reliable model knowledge without pretending a source was consulted."
    return "\n\n".join(
        f"[SOURCE {i}] {r['source']} page {r.get('page')}:\n{r['text']}"
        for i, r in enumerate(results, 1)
    )


def teach(req):
    session = get_session(req.session_id)
    if not session:
        raise ValueError("Session not found.")

    student = get_student(session["student_id"]) or {
        "name": "Student", "level": "beginner", "language": "English", "goal": "understand concepts deeply"
    }
    progress = get_progress(session["student_id"])

    # Search using topic + current request. The hybrid retriever first uses the
    # local index and only invokes semantic embeddings when lexical evidence is
    # weak, so classroom responses stay fast.

    rag_query = f"{session['topic']} {req.message}"
    rag = search(rag_query, top_k=5)
    progress_text = "\n".join(
        f"- {p['topic']}: mastery={p['mastery']:.2f}; misconceptions={p['misconceptions_json']}"
        for p in progress[:10]
    ) or "- No previous mastery data."

    lesson = session.get("lesson") or {}
    duration = lesson.get("duration_minutes", 10)
    language = req.language or lesson.get("language") or student.get("language", "English")
    level = req.level or lesson.get("level") or student.get("level", "beginner")
    previous_concepts = lesson.get("conceptsCovered", [])[-8:]

    prompt = f"""
{TEACHER_RULES}

Student:
name={student['name']}
level={level}
language={language}
goal={student['goal']}

Current lesson:
subject={session['subject']}
topic={session['topic']}
duration_minutes={duration}
concepts_already_covered={previous_concepts}

Current progress:
{progress_text}

Requested depth: {req.depth or "medium"}
Mode: {req.mode}
Student message: {req.message}

Retrieved course context:
{_context_block(rag)}

Return ONLY the structured JSON required by the API schema.
At the end, include 3-5 suggested_topics and 3-5 suggested_questions related to the current topic or uploaded material.
If uploaded material is retrieved, suggestions must stay grounded in that material where possible.
Make the response suitable for speaking aloud by a female Indian teacher.
LANGUAGE CHECK BEFORE RETURNING: compare every natural-language sentence against the selected language. If selected English, remove all Hindi words. If selected Hindi, remove all English explanatory sentences. Do not return mixed-language prose.
If this is the beginning of the lesson, introduce the topic briefly and start concept 1.
If this is a doubt, answer the doubt first without losing the lesson context.
If this is a teacher-question answer, respond as a teacher evaluating the student's reply.
If this is an understanding-check reply, acknowledge a yes naturally; for no, ask which concept to repeat; for all, restart the topic from concept 1.
"""
    decision = generate_structured(prompt, TeacherDecision, fast=req.mode in {"doubt", "understanding"})
    decision.sources_used = [f"{r['source']} p.{r.get('page')}" for r in rag]
    return decision, rag


def evaluate(req):
    session = get_session(req.session_id)
    if not session:
        raise ValueError("Session not found.")
    rag = search(f"{session['topic']} {req.question} {req.expected_concept}", top_k=4)
    prompt = f"""
{TEACHER_RULES}

Evaluate a student's answer as a classroom teacher.

Topic: {session['topic']}
Question: {req.question}
Student answer: {req.student_answer or "No answer was received within 30 seconds."}
Expected concept: {req.expected_concept}

Relevant course context:
{_context_block(rag)}

Return only the evaluation JSON. The explanation should be clear and suitable for speaking aloud.
If no answer was received within 30 seconds, set correct=false, score=0, explain the correct answer in detail, and set recommended_action to "explain_then_continue".
"""
    return generate_structured(prompt, Evaluation, fast=True), rag


def create_lesson(req: LessonRequest):
    prompt = f"""
{TEACHER_RULES}

Create a classroom lesson plan.
Subject: {req.subject}
Topic: {req.topic}
Student level: {req.level}
Language: {req.language}
Duration: {req.duration_minutes} minutes

The plan must fit the duration and progress from prerequisite/intuitive understanding to formal concept,
examples, one or more checks, and a concise final summary. Do not over-pack a short lesson.
Return only the requested structured JSON.
"""
    return generate_structured(prompt, LessonPlan)
