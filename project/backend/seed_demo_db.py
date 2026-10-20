"""Create/reset a local demo SQLite database with safe fake accounts.

Run from backend/: python seed_demo_db.py
This is demo data only; change passwords before any real deployment.
"""
from app.db import init_db, get_conn, create_user, upsert_student, update_progress
from app.services.security import hash_password

USERS = [
    ("demo-001", "Demo Student", "demo@edureal.ai", "EduReal@123", "beginner", "English"),
    ("hindi-001", "Demo Hindi Student", "hindi@edureal.ai", "EduReal@123", "intermediate", "Hindi"),
    ("test-001", "Test Student", "student@edureal.ai", "Student@123", "advanced", "English"),
]

def main():
    init_db()
    conn = get_conn()
    for table in ("auth_tokens", "progress", "messages", "sessions", "students", "users"):
        conn.execute(f"DELETE FROM {table}")
    conn.commit()
    conn.close()
    for uid, name, email, password, level, language in USERS:
        create_user(uid, name, email, hash_password(password), level, language)
        upsert_student(uid, name, level, language, "Understand concepts deeply")
    update_progress("demo-001", "Newton's Laws of Motion", 0.78)
    update_progress("demo-001", "Kinematics", 0.64)
    update_progress("hindi-001", "गति के नियम", 0.72)
    print("Demo database ready.")
    print("Accounts:")
    for _, name, email, password, level, language in USERS:
        print(f"  {name}: {email} / {password} ({language}, {level})")

if __name__ == "__main__":
    main()
