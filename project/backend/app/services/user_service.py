"""Business logic for user registration.

Kept separate from app/api/routes.py (the controller layer) so the route
handler only deals with HTTP concerns (status codes, request/response
shapes) and this module owns validation + persistence rules.
"""

import re
import uuid

from ..db import get_user_by_email, create_user, upsert_student
from ..models.user import User
from ..schemas import RegisterRequest
from .security import hash_password

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
ALLOWED_LEVELS = {"beginner", "intermediate", "advanced"}


class ValidationError(Exception):
    """Raised when the incoming registration payload fails validation."""


class EmailAlreadyExistsError(Exception):
    """Raised when the email is already registered."""


def _validate(req: RegisterRequest) -> tuple[str, str, str, str]:
    full_name = req.full_name.strip()
    email = req.email.strip().lower()
    level = (req.level or "beginner").strip().lower()
    language = (req.language or "English").strip()

    if len(full_name) < 2:
        raise ValidationError("Full name must be at least 2 characters.")
    if not EMAIL_RE.match(email):
        raise ValidationError("Enter a valid email address.")
    if len(req.password) < 8 or not re.search(r"[A-Z]", req.password) or not re.search(r"[0-9]", req.password):
        raise ValidationError(
            "Password must be at least 8 characters and include an uppercase letter and a number."
        )
    if req.password != req.confirm_password:
        raise ValidationError("Passwords do not match.")
    if level not in ALLOWED_LEVELS:
        raise ValidationError("Select a valid learning level.")
    if not language:
        raise ValidationError("Select a preferred language.")

    return full_name, email, level, language


def register_user(req: RegisterRequest) -> User:
    """Validate, hash, and persist a new user. Raises ValidationError or
    EmailAlreadyExistsError on failure; otherwise returns the created User.
    """
    full_name, email, level, language = _validate(req)

    if get_user_by_email(email):
        raise EmailAlreadyExistsError("An account with this email already exists.")

    user_id = str(uuid.uuid4())
    create_user(
        user_id=user_id,
        full_name=full_name,
        email=email,
        password_hash=hash_password(req.password),
        level=level,
        language=language,
    )

    # Keep the existing student/session architecture in sync so the newly
    # registered account can immediately start lessons as itself instead of
    # the shared "demo-student" placeholder.
    upsert_student(user_id, full_name, level, language, goal="understand concepts deeply")

    return User.from_row(get_user_by_email(email))
