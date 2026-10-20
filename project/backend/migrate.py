"""Apply database migrations.

Creates every table (including `users`) if it doesn't already exist yet.
Safe to run repeatedly — it never drops or overwrites existing data.

Usage (from the backend/ directory, with the virtualenv active):

    python migrate.py
"""

from app.db import init_db
from app.config import DB_PATH

if __name__ == "__main__":
    init_db()
    print(f"Database schema is up to date at: {DB_PATH}")
