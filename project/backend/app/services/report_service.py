import html
import os
import re
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    Image, KeepTogether
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon
from reportlab.graphics import renderPDF
from ..config import REPORT_DIR
from ..db import get_session, get_messages, update_session
from ..rag.store import search
from ..services.gemini_service import generate_structured
from ..schemas import ReportContent

FONT_REG = "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf"
if os.path.exists(FONT_REG):
    pdfmetrics.registerFont(TTFont("EduNoto", FONT_REG))
    if os.path.exists(FONT_BOLD):
        pdfmetrics.registerFont(TTFont("EduNotoBold", FONT_BOLD))
else:
    FONT_REG, FONT_BOLD = "Helvetica", "Helvetica-Bold"


def esc(s):
    return html.escape(str(s or "")).replace("\n", "<br/>")


def _concept_diagram(title, concepts):
    concepts = concepts[:5] or ["Topic", "Core idea", "Example"]
    w, h = 450, 180
    d = Drawing(w, h)
    cx = w / 2
    d.add(Rect(cx - 85, h - 55, 170, 35, rx=8, ry=8, fillColor=colors.HexColor("#1f2937"), strokeColor=colors.HexColor("#7c3aed")))
    d.add(String(cx, h - 42, str(title)[:28], textAnchor="middle", fontName="EduNotoBold", fontSize=10, fillColor=colors.white))
    y = h - 105
    gap = w / max(1, len(concepts))
    for i, c in enumerate(concepts):
        x = gap * (i + 0.5)
        d.add(Line(cx, h - 55, x, y + 30, strokeColor=colors.HexColor("#9ca3af")))
        d.add(Rect(x - 55, y, 110, 30, rx=6, ry=6, fillColor=colors.HexColor("#f3f4f6"), strokeColor=colors.HexColor("#c4b5fd")))
        d.add(String(x, y + 10, str(c)[:20], textAnchor="middle", fontName="EduNoto", fontSize=7.5, fillColor=colors.HexColor("#111827")))
    return d


def _formula_diagram(formula):
    d = Drawing(450, 95)
    d.add(Rect(25, 20, 400, 55, rx=8, ry=8, fillColor=colors.HexColor("#f8fafc"), strokeColor=colors.HexColor("#7c3aed")))
    d.add(String(225, 42, str(formula)[:70], textAnchor="middle", fontName="EduNotoBold", fontSize=17, fillColor=colors.HexColor("#111827")))
    return d


def _build_report_content(session, lesson, messages):
    """Build the final report locally from recorded classroom data.

    This intentionally does not make another Gemini request when a class ends.
    Ending a lesson should be immediate and reliable. The live teacher already
    recorded concept explanations, formulas, questions and board diagrams.
    """
    ai_messages = [m for m in messages if m["sender"] == "ai"]
    sections = []
    seen = set()
    for m in ai_messages:
        try:
            meta = __import__("json").loads(m.get("metadata_json") or "{}")
        except Exception:
            meta = {}
        concept = (meta.get("concept") or "").strip()
        if not concept or concept in seen:
            continue
        seen.add(concept)
        formulas = [f for f in (meta.get("formulas") or []) if f]
        board_formula = meta.get("board_formula") or ""
        if board_formula and board_formula not in formulas:
            formulas.insert(0, board_formula)
        explanation = (meta.get("concept_summary") or m.get("text") or "").strip()
        sections.append({
            "title": concept,
            "explanation": explanation,
            "real_life_example": "Review the example explained during the live class and connect this concept to a real-world situation.",
            "formulas": formulas[:4],
            "theoretical_questions": [
                f"What is {concept}?",
                f"Why is {concept} important in {session['topic']}?"
            ],
            "numerical_questions": [],
            "theoretical_answers": [
                explanation or f"{concept} was explained during the completed lesson.",
                "Use the definition, key points and board explanation recorded above."
            ],
            "numerical_answers": [],
            "visual_description": meta.get("board_diagram") or "Concept flow: definition → key idea → application."
        })

    # If metadata was sparse, still create useful sections from the board history.
    for b in lesson.get("boardHistory", []):
        concept = (b.get("concept") or b.get("title") or "Lesson concept").strip()
        if concept in seen:
            continue
        seen.add(concept)
        explanation = next((m["text"] for m in reversed(ai_messages) if m["text"].strip()), "")
        sections.append({
            "title": concept,
            "explanation": explanation or "This concept was covered during the live lesson.",
            "real_life_example": "Connect this concept with the classroom example discussed in the lesson.",
            "formulas": [b.get("formula")] if b.get("formula") else [],
            "theoretical_questions": [f"Explain {concept} in your own words."],
            "numerical_questions": [],
            "theoretical_answers": ["Use the definition and key points written on the blackboard."],
            "numerical_answers": [],
            "visual_description": b.get("diagram") or "Concept flow: input → process → result."
        })

    return ReportContent(
        overview=f"Completed lesson report for {session['topic']}. This report contains the concepts, explanations, formulas, questions and blackboard material recorded during the class.",
        sections=sections,
        important_formulas=lesson.get("formulas", []),
        important_points=lesson.get("keyConcepts", []),
        final_summary=lesson.get("summary") or f"The lesson covered {session['topic']} through teacher explanations, examples, checks and blackboard notes."
    )


def generate_report(session_id):
    session = get_session(session_id)
    if not session:
        raise ValueError("Session not found")
    lesson = session.get("lesson") or {}
    messages = get_messages(session_id)
    try:
        report_content = _build_report_content(session, lesson, messages)
    except Exception:
        # Never return an empty PDF because a second Gemini call hit quota or
        # a transient provider error. Build a useful report from the recorded
        # teacher turns and board history.
        sections = []
        for b in lesson.get("boardHistory", [])[:12]:
            concept = b.get("concept") or "Lesson concept"
            sections.append({
                "title": concept,
                "explanation": next((m["text"] for m in reversed(messages)
                                     if m["sender"] == "ai" and m["text"].strip()), "Recorded lesson explanation."),
                "real_life_example": "Review the classroom explanation above and connect the concept to an everyday situation.",
                "formulas": [b.get("formula")] if b.get("formula") else [],
                "theoretical_questions": [f"What is the main idea of {concept}?"],
                "numerical_questions": [],
                "theoretical_answers": ["Explain the concept in your own words using the definition and example taught in class."],
                "numerical_answers": [],
                "visual_description": b.get("diagram") or "Concept flow: cause → process → result."
            })
        report_content = ReportContent(
            overview=f"Study report for {session['topic']}. The report is compiled from the completed classroom session.",
            sections=sections,
            important_formulas=lesson.get("formulas", []),
            important_points=lesson.get("keyConcepts", []),
            final_summary=lesson.get("summary") or f"Review the concepts, formulas and questions covered in the {session['topic']} lesson."
        )
    lesson["report_content"] = report_content.model_dump()
    update_session(session_id, lesson=lesson)
    reports = []
    seen = set()
    for m in messages:
        meta = {}
        try:
            import json
            meta = json.loads(m.get("metadata_json") or "{}")
        except Exception:
            pass
        if m["sender"] == "ai" and meta.get("concept"):
            concept = meta.get("concept")
            if concept not in seen:
                seen.add(concept)
                reports.append({
                    "concept": concept,
                    "summary": meta.get("concept_summary") or m["text"],
                    "response": m["text"],
                    "board": meta.get("board_items", []),
                    "formula": meta.get("board_formula") or (meta.get("formulas") or [""])[0],
                    "diagram": meta.get("board_diagram", ""),
                })

    os.makedirs(REPORT_DIR, exist_ok=True)
    safe_topic = re.sub(r"[^A-Za-z0-9_-]+", "_", session["topic"]).strip("_") or "lesson"
    path = os.path.join(REPORT_DIR, f"EduReal_{session_id}_{safe_topic}.pdf")

    styles = getSampleStyleSheet()
    base = "EduNoto" if FONT_REG == "EduNoto" else "Helvetica"
    bold = "EduNotoBold" if FONT_BOLD == "EduNotoBold" else "Helvetica-Bold"
    title = ParagraphStyle("title", parent=styles["Title"], fontName=bold, fontSize=22, leading=28, alignment=TA_CENTER, textColor=colors.HexColor("#111827"), spaceAfter=10)
    h1 = ParagraphStyle("h1", parent=styles["Heading1"], fontName=bold, fontSize=15, leading=20, textColor=colors.HexColor("#5b21b6"), spaceBefore=12, spaceAfter=7)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], fontName=bold, fontSize=12, leading=17, textColor=colors.HexColor("#111827"), spaceBefore=8, spaceAfter=5)
    body = ParagraphStyle("body", parent=styles["BodyText"], fontName=base, fontSize=9.6, leading=15, textColor=colors.HexColor("#27303f"), spaceAfter=7)
    small = ParagraphStyle("small", parent=body, fontSize=8, leading=11, textColor=colors.HexColor("#64748b"))
    formula = ParagraphStyle("formula", parent=body, fontName=bold, fontSize=16, leading=22, alignment=TA_CENTER, textColor=colors.HexColor("#5b21b6"))

    doc = SimpleDocTemplate(path, pagesize=A4, rightMargin=16*mm, leftMargin=16*mm, topMargin=15*mm, bottomMargin=15*mm, title=f"EduReal AI — {session['topic']}")
    story = []
    story += [Paragraph("EduReal AI — Lesson Report", title), Paragraph(esc(session["topic"]), title)]
    story += [Paragraph(f"Subject: {esc(session['subject'])} &nbsp;&nbsp; | &nbsp;&nbsp; Duration: {lesson.get('duration_minutes', 0)} min &nbsp;&nbsp; | &nbsp;&nbsp; Language: {esc(lesson.get('language','English'))}", small), Spacer(1, 8)]

    story.append(Paragraph("1. Lesson Overview", h1))
    story.append(Paragraph(esc(report_content.overview or lesson.get("overview") or f"This lesson covered {session['topic']} through an adaptive teacher-led explanation."), body))

    story.append(Paragraph("2. Detailed Explanation by Concept", h1))
    if report_content.sections:
        for idx, sec in enumerate(report_content.sections, 1):
            story.append(Paragraph(f"{idx}. {esc(sec.title)}", h2))
            story.append(Paragraph(esc(sec.explanation), body))
            if sec.real_life_example:
                story.append(Paragraph("Real-life example", h2))
                story.append(Paragraph(esc(sec.real_life_example), body))
            for f in sec.formulas:
                story.append(Paragraph(esc(f), formula))
                story.append(_formula_diagram(f))
            if sec.visual_description:
                story.append(Paragraph("Visual / diagram", h2))
                story.append(Paragraph(esc(sec.visual_description), body))
                story.append(_concept_diagram(sec.title, [sec.visual_description, "Cause → Process → Result"]))
            if sec.theoretical_questions:
                story.append(Paragraph("Theoretical questions + answers", h2))
                for i, q in enumerate(sec.theoretical_questions):
                    story.append(Paragraph(f"Q{i+1}. {esc(q)}", body))
                    if i < len(sec.theoretical_answers):
                        story.append(Paragraph("<b>Answer:</b> " + esc(sec.theoretical_answers[i]), body))
            if sec.numerical_questions:
                story.append(Paragraph("Numerical / application questions + answers", h2))
                for i, q in enumerate(sec.numerical_questions):
                    story.append(Paragraph(f"Q{i+1}. {esc(q)}", body))
                    if i < len(sec.numerical_answers):
                        story.append(Paragraph("<b>Worked answer:</b> " + esc(sec.numerical_answers[i]), body))
    else:
        story.append(Paragraph("No structured concept report was generated.", body))

    formulas = report_content.important_formulas or lesson.get("formulas", [])
    if formulas:
        story.append(Paragraph("3. Important Formulas", h1))
        for f in formulas:
            story.append(Paragraph("• " + esc(f), body))

    key_points = report_content.important_points or lesson.get("keyConcepts", [])
    if key_points:
        story.append(Paragraph("4. Key Concepts", h1))
        for k in key_points:
            story.append(Paragraph("• " + esc(k), body))

    questions = lesson.get("questions", [])
    story.append(Paragraph("5. Important Questions", h1))
    if questions:
        for q in questions:
            story.append(Paragraph("• " + esc(q), body))
    else:
        story.append(Paragraph("• Explain the central concept in your own words.", body))
        story.append(Paragraph("• State and interpret the most important formula(s).", body))
        story.append(Paragraph("• Solve a representative numerical/problem-based question where applicable.", body))
        story.append(Paragraph("• Describe one real-world application.", body))

    story.append(Paragraph("6. Questions Asked During the Lesson", h1))
    user_msgs = [m for m in messages if m["sender"] == "user" and m["text"].strip()]
    if user_msgs:
        for m in user_msgs:
            story.append(Paragraph("• " + esc(m["text"]), body))
    else:
        story.append(Paragraph("No student questions were recorded.", body))

    story.append(Paragraph("7. Final Summary", h1))
    summary = report_content.final_summary or lesson.get("summary") or "The lesson built the topic from its core idea to applications and checks for understanding. Review the concept sections, formulas and questions above for revision."
    story.append(Paragraph(esc(summary), body))

    story.append(Paragraph("8. Suggested Next Study", h1))
    for item in lesson.get("suggestedTopics", [])[:5]:
        story.append(Paragraph("• Topic: " + esc(item), body))
    for item in lesson.get("suggestedQuestions", [])[:5]:
        story.append(Paragraph("• Question: " + esc(item), body))

    story.append(Paragraph("9. Blackboard Record", h1))
    board_history = lesson.get("boardHistory", [])
    if board_history:
        data = [["Concept", "Blackboard writing"]]
        for b in board_history:
            data.append([b.get("concept", ""), "\n".join(b.get("items", [])) + (f"\nFormula: {b.get('formula')}" if b.get('formula') else "")])
        table = Table(data, colWidths=[50*mm, 125*mm], repeatRows=1)
        table.setStyle(TableStyle([
            ("FONTNAME", (0,0), (-1,-1), base), ("FONTNAME", (0,0), (-1,0), bold),
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#ede9fe")), ("GRID", (0,0), (-1,-1), 0.4, colors.HexColor("#cbd5e1")),
            ("VALIGN", (0,0), (-1,-1), "TOP"), ("FONTSIZE", (0,0), (-1,-1), 8.5), ("LEADING", (0,0), (-1,-1), 12),
            ("LEFTPADDING", (0,0), (-1,-1), 6), ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ]))
        story.append(table)
    else:
        story.append(Paragraph("No blackboard history was recorded.", body))

    story.append(Paragraph("10. RAG / Source Context", h1))
    sources = lesson.get("sources", [])
    if sources:
        for s in sources:
            story.append(Paragraph("• " + esc(s), body))
    else:
        story.append(Paragraph("No uploaded course material was used for this lesson.", body))

    doc.build(story)
    return path
