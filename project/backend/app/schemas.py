from pydantic import BaseModel, Field
from typing import Optional


class StudentRequest(BaseModel):
    student_id: str = "demo-student"
    name: str = "Student"
    level: str = "beginner"
    language: str = "English"
    goal: str = "understand concepts deeply"


class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    confirm_password: str
    level: str = "beginner"
    language: str = "English"


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


class UserOut(BaseModel):
    id: str
    full_name: str
    email: str
    level: str
    language: str
    created_at: str


class SessionRequest(BaseModel):
    student_id: str = "demo-student"
    subject: str = "Physics"
    topic: str = "Newton's Laws of Motion"
    duration_minutes: int = Field(default=10, ge=1, le=180)
    language: str = "English"
    level: str = "beginner"


class TeachRequest(BaseModel):
    session_id: str
    message: str
    level: Optional[str] = None
    language: Optional[str] = None
    depth: str = "detailed"
    mode: str = "teach"  # teach | doubt


class TeacherDecision(BaseModel):
    response: str = Field(description="What the teacher should say aloud to the student.")
    concept: str = Field(description="The single concept currently being taught.")
    concept_summary: str = ""
    level_detected: str = "mixed"
    action: str = "continue"
    strategy: str = "mixed"
    understanding_estimate: float = Field(default=0.1, ge=0, le=1)
    ask_check_question: bool = False
    check_question: str = ""
    check_kind: str = "concept"  # concept | understanding
    repeat_topic: str = ""
    formulas: list[str] = []
    key_points: list[str] = []
    board_title: str = ""
    board_items: list[str] = []
    board_formula: str = ""
    board_diagram: str = ""
    sources_used: list[str] = []
    suggested_topics: list[str] = []
    suggested_questions: list[str] = []


class EvaluateRequest(BaseModel):
    session_id: str
    question: str
    student_answer: str = ""
    expected_concept: str = ""


class Evaluation(BaseModel):
    correct: bool
    score: float = Field(ge=0, le=1)
    explanation: str
    misconception: str = ""
    recommended_action: str
    next_question: str = ""


class LessonRequest(BaseModel):
    student_id: str = "demo-student"
    topic: str
    subject: str = "General"
    level: str = "beginner"
    language: str = "English"
    duration_minutes: int = Field(default=30, ge=1, le=180)


class LessonSection(BaseModel):
    title: str
    objective: str
    minutes: int
    teaching_strategy: str
    check_question: str


class LessonPlan(BaseModel):
    title: str
    level: str
    subject: str
    topic: str
    sections: list[LessonSection]
    mastery_goal: str


class ReportSection(BaseModel):
    title: str
    explanation: str
    real_life_example: str = ""
    formulas: list[str] = []
    theoretical_questions: list[str] = []
    numerical_questions: list[str] = []
    theoretical_answers: list[str] = []
    numerical_answers: list[str] = []
    visual_description: str = ""


class ReportContent(BaseModel):
    overview: str
    sections: list[ReportSection] = []
    important_formulas: list[str] = []
    important_points: list[str] = []
    final_summary: str
