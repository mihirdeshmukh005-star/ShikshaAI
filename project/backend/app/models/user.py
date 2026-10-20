"""Database-side representation of a registered user.

This is the persistence model (maps 1:1 to the `users` table defined in
migrations/0001_create_users_table.sql). It is intentionally kept separate
from the pydantic request/response schemas in `app/schemas.py`, which
describe the API contract instead of the storage layer.
"""

from dataclasses import dataclass


@dataclass
class User:
    id: str
    full_name: str
    email: str
    password_hash: str
    level: str
    language: str
    created_at: str

    @classmethod
    def from_row(cls, row) -> "User":
        return cls(
            id=row["id"],
            full_name=row["full_name"],
            email=row["email"],
            password_hash=row["password_hash"],
            level=row["level"],
            language=row["language"],
            created_at=row["created_at"],
        )

    def public_dict(self) -> dict:
        """Serializable view that never includes the password hash."""
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "level": self.level,
            "language": self.language,
            "created_at": self.created_at,
        }
