import os
import uuid
import asyncio
from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from datetime import datetime, timezone, timedelta
from fastapi.responses import FileResponse
from ..schemas import (
    StudentRequest, SessionRequest, TeachRequest, EvaluateRequest, LessonRequest,
    RegisterRequest, UserOut, LoginRequest, AuthResponse,
)
from ..db import (
    upsert_student, get_student, create_session, get_session, add_message,
    update_session, get_messages, get_progress, update_progress,
)
from ..services.teacher_service import teach, evaluate, create_lesson
from ..services.report_service import generate_report
from ..services.user_service import register_user, ValidationError, EmailAlreadyExistsError
from ..services.security import verify_password
from ..db import get_user_by_email, get_user_by_token, create_auth_token, delete_auth_token
from ..rag.processor import ingest_material
from ..rag.store import count
from ..config import UPLOAD_DIR

router = APIRouter(prefix="/api")


@router.get("/health")
def health():
    return {"ok": True, "service": "EduReal AI backend"}


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(req: RegisterRequest):
    try:
        user = register_user(req)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except EmailAlreadyExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    token = uuid.uuid4().hex + uuid.uuid4().hex
    expires = datetime.now(timezone.utc) + timedelta(days=7)
    create_auth_token(user.id, token, expires.isoformat())
    return {"token": token, "user": user.public_dict()}




def _assert_session_owner(session_id, user):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session["student_id"] != user["id"]:
        raise HTTPException(403, "You do not have access to this lesson.")
    return session


def _current_user(authorization: str | None):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Please sign in to continue.")
    token = authorization.split(" ", 1)[1].strip()
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(401, "Your session has expired. Please sign in again.")
    return user


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    user = get_user_by_email(req.email.strip().lower())
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password.")
    token = uuid.uuid4().hex + uuid.uuid4().hex
    expires = datetime.now(timezone.utc) + timedelta(days=7)
    create_auth_token(user["id"], token, expires.isoformat())
    public = {k: user[k] for k in ("id","full_name","email","level","language","created_at")}
    return {"token": token, "user": public}


@router.get("/me")
def me(authorization: str | None = Header(default=None)):
    user = _current_user(authorization)
    return {"user": {k: user[k] for k in ("id","full_name","email","level","language","created_at")}}


@router.post("/logout")
def logout(authorization: str | None = Header(default=None)):
    if authorization and authorization.lower().startswith("bearer "):
        delete_auth_token(authorization.split(" ", 1)[1].strip())
    return {"success": True}


@router.post("/students")
def save_student(req: StudentRequest, authorization: str | None = Header(default=None)):
    user = _current_user(authorization)
    req.student_id = user["id"]
    language = "Hindi" if req.language.lower().startswith("hindi") else "English"
    upsert_student(req.student_id, req.name, req.level, language, req.goal)
    return {"success": True, "student": get_student(req.student_id)}


@router.get("/students/{student_id}/progress")
def student_progress(student_id: str, authorization: str | None = Header(default=None)):
    user = _current_user(authorization)
    student_id = user["id"]
    return {"student_id": student_id, "progress": get_progress(student_id)}


@router.post("/sessions/start")
def start_session(req: SessionRequest, authorization: str | None = Header(default=None)):
    user = _current_user(authorization)
    language = "Hindi" if req.language.lower().startswith("hindi") else "English"
    level = req.level or "beginner"
    req.student_id = user["id"]
    language = user.get("language") or language
    student = get_student(req.student_id)
    if not student:
        upsert_student(req.student_id, "Student", level, language)
    else:
        upsert_student(req.student_id, student.get("name", "Student"), level, language, student.get("goal", "understand concepts deeply"))

    sid = str(uuid.uuid4())
    lesson = {
        "subject": req.subject,
        "topic": req.topic.strip(),
        "duration_minutes": req.duration_minutes,
        "language": language,
        "level": level,
        "conceptsTotal": max(3, min(12, round(req.duration_minutes / 3))),
        "conceptsDone": 0,
        "conceptsCovered": [],
        "keyConcepts": [],
        "formulas": [],
        "questions": [],
        "board": {"title": req.topic.strip(), "items": [], "formula": "", "diagram": ""},
        "boardHistory": [],
        "sources": [],
        "status": "active",
        "started_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
    }
    create_session(sid, req.student_id, req.subject, req.topic.strip(), lesson)

    # Prefetch the first teaching segment as part of session creation. The
    # browser now receives the session + first lesson data in one request,
    # eliminating the old sequential "start -> then teach" round trip.
    opening = None
    try:
        opening_req = TeachRequest(
            session_id=sid,
            message=f'Start the live lesson on "{req.topic.strip()}". Teach the first concept now. Duration is {req.duration_minutes} minutes and selected language is {language}.',
            level=level, language=language, depth="basic" if req.duration_minutes <= 5 else "moderate", mode="teach"
        )
        decision, rag = teach(opening_req)
        add_message(sid, "ai", decision.response, decision.model_dump())
        lesson["board"] = {
            "title": decision.board_title or decision.concept,
            "items": decision.board_items[:6],
            "formula": decision.board_formula or (decision.formulas[0] if decision.formulas else ""),
            "diagram": decision.board_diagram,
        }
        lesson["conceptsCovered"] = [decision.concept] if decision.concept else []
        lesson["conceptsDone"] = len(lesson["conceptsCovered"])
        lesson["keyConcepts"] = decision.key_points[:12]
        lesson["formulas"] = decision.formulas[:12]
        lesson["questions"] = [decision.check_question] if decision.check_question else []
        lesson["sources"] = decision.sources_used[:30]
        lesson["suggestedTopics"] = decision.suggested_topics[:5]
        lesson["suggestedQuestions"] = decision.suggested_questions[:5]
        update_session(sid, lesson=lesson)
        opening = {"answer": decision.response, "decision": decision.model_dump(), "lesson": lesson}
    except Exception as exc:
        # The session is still valid; the UI can retry the first segment.
        opening = {"error": str(exc), "lesson": lesson}

    return {"success": True, "session_id": sid, "lesson": lesson, "messages": [], "opening": opening}


@router.get("/sessions/{session_id}")
def session(session_id: str, authorization: str | None = Header(default=None)):
    user = _current_user(authorization)
    _assert_session_owner(session_id, user)
    s = get_session(session_id)
    if not s:
        raise HTTPException(404, "Session not found")
    return {"session": s, "messages": get_messages(session_id)}


@router.post("/teacher/teach")
def teacher(req: TeachRequest, authorization: str | None = Header(default=None)):
    user = _current_user(authorization)
    _assert_session_owner(req.session_id, user)
    try:
        decision, rag = teach(req)
        add_message(req.session_id, "user", req.message, {"mode": req.mode})
        meta = decision.model_dump()
        add_message(req.session_id, "ai", decision.response, meta)
        s = get_session(req.session_id)
        lesson = s["lesson"]

        # Every lesson turn replaces the board. This is deliberately not merged with
        # the previous board so stale Newton-law content cannot survive a new topic.
        lesson["board"] = {
            "title": decision.board_title or decision.concept,
            "items": decision.board_items[:6],
            "formula": decision.board_formula or (decision.formulas[0] if decision.formulas else ""),
            "diagram": decision.board_diagram,
        }
        if decision.concept and decision.concept not in lesson.get("conceptsCovered", []):
            lesson.setdefault("conceptsCovered", []).append(decision.concept)
            lesson["conceptsDone"] = min(lesson.get("conceptsTotal", 5), len(lesson["conceptsCovered"]))
        lesson["keyConcepts"] = list(dict.fromkeys((lesson.get("keyConcepts", []) + decision.key_points)))[:12]
        lesson["formulas"] = list(dict.fromkeys((lesson.get("formulas", []) + decision.formulas)))[:12]
        if decision.check_question:
            lesson["questions"] = list(dict.fromkeys((lesson.get("questions", []) + [decision.check_question])))[:20]
        lesson["sources"] = list(dict.fromkeys((lesson.get("sources", []) + decision.sources_used)))[:30]
        lesson["suggestedTopics"] = decision.suggested_topics[:5]
        lesson["suggestedQuestions"] = decision.suggested_questions[:5]
        lesson.setdefault("boardHistory", []).append({
            "concept": decision.concept,
            "items": decision.board_items[:6],
            "formula": lesson["board"]["formula"],
            "diagram": decision.board_diagram,
        })
        lesson["current_check_question"] = decision.check_question if decision.ask_check_question else ""
        lesson["current_check_kind"] = decision.check_kind if decision.ask_check_question else ""
        update_session(req.session_id, lesson=lesson)
        return {"success": True, "answer": decision.response, "decision": decision.model_dump(), "sources": rag, "lesson": lesson}
    except Exception as e:
        msg = str(e)
        status = 429 if "quota" in msg.lower() or "rate limit" in msg.lower() else 500
        raise HTTPException(status, msg)


@router.post("/assessment/evaluate")
def assessment(req: EvaluateRequest, authorization: str | None = Header(default=None)):
    user = _current_user(authorization)
    _assert_session_owner(req.session_id, user)
    try:
        result, rag = evaluate(req)
        session = get_session(req.session_id)
        topic = session["topic"] if session else "General"
        if session:
            update_progress(session["student_id"], topic, result.score, result.misconception or None)
        add_message(req.session_id, "assessment", result.explanation, result.model_dump())
        return {"success": True, "evaluation": result.model_dump(), "sources": rag}
    except Exception as e:
        msg = str(e)
        status = 429 if "quota" in msg.lower() or "rate limit" in msg.lower() else 500
        raise HTTPException(status, msg)


@router.post("/lessons/create")
def lesson(req: LessonRequest):
    try:
        return {"success": True, "lesson": create_lesson(req).model_dump()}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...), authorization: str | None = Header(default=None)):
    _current_user(authorization)
    if not file.filename:
        raise HTTPException(400, "A file is required.")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in {".pdf", ".docx", ".pptx", ".txt", ".md", ".csv", ".json"}:
        raise HTTPException(400, "Supported materials: PDF, DOCX, PPTX, TXT, MD, CSV and JSON.")
    safe_name = os.path.basename(file.filename).replace(" ", "_")
    path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{safe_name}")
    data = await file.read()
    if len(data) > 25 * 1024 * 1024:
        raise HTTPException(413, "Maximum upload size is 25 MB.")
    with open(path, "wb") as out:
        out.write(data)
    try:
        result = await asyncio.to_thread(ingest_material, path, safe_name)
        return {"success": True, "file": safe_name, "rag": result, "indexed_chunks": count()}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/rag/status")
def rag_status():
    return {"indexed_chunks": count()}


@router.post("/lessons/{session_id}/complete")
def complete_lesson(session_id: str, authorization: str | None = Header(default=None)):
    user = _current_user(authorization)
    _assert_session_owner(session_id, user)
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    lesson = session["lesson"]
    lesson["status"] = "completed"
    lesson["ended_at"] = __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat()
    lesson["summary"] = lesson.get("summary") or (
        f"Revision summary for {session['topic']}: review each concept recorded during the live class, "
        "then practise the important questions and formulas in the report."
    )
    update_session(session_id, lesson=lesson)
    path = generate_report(session_id)
    return {"success": True, "lesson": lesson, "report_url": f"/api/lessons/{session_id}/report"}


@router.get("/lessons/{session_id}/report")
def report(session_id: str, authorization: str | None = Header(default=None)):
    user = _current_user(authorization)
    _assert_session_owner(session_id, user)
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session.get("lesson", {}).get("status") != "completed":
        raise HTTPException(409, "Export is available only after the live lesson is completed.")
    path = generate_report(session_id)
    return FileResponse(path, media_type="application/pdf", filename=os.path.basename(path))
