import json
import sqlite3
from datetime import datetime, timezone
from .config import DB_PATH


def now():
    return datetime.now(timezone.utc).isoformat()


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    # Schema mirrors migrations/0001_create_users_table.sql (users table)
    # plus the original session/progress tables. CREATE TABLE IF NOT EXISTS
    # makes this safe to call on every startup without touching existing rows.
    conn = get_conn()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        level TEXT DEFAULT 'beginner',
        language TEXT DEFAULT 'English',
        goal TEXT DEFAULT 'understand concepts',
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        subject TEXT DEFAULT 'General',
        topic TEXT DEFAULT 'Open Question',
        previous_interaction_id TEXT,
        lesson_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        text TEXT NOT NULL,
        metadata_json TEXT,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS progress (
        student_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        mastery REAL DEFAULT 0.0,
        attempts INTEGER DEFAULT 0,
        misconceptions_json TEXT DEFAULT '[]',
        updated_at TEXT NOT NULL,
        PRIMARY KEY(student_id, topic)
    );
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        level TEXT DEFAULT 'beginner',
        language TEXT DEFAULT 'English',
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auth_tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rag_chunks (
        id TEXT PRIMARY KEY,
        material_id TEXT NOT NULL,
        source TEXT NOT NULL,
        page TEXT,
        text TEXT NOT NULL,
        embedding_json TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        FOREIGN KEY(material_id) REFERENCES materials(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_rag_source ON rag_chunks(source);
    """)
    conn.commit()
    conn.close()


def upsert_student(student_id, name, level="beginner", language="English", goal="understand concepts"):
    conn = get_conn()
    conn.execute(
        "INSERT INTO students(id,name,level,language,goal,created_at) VALUES(?,?,?,?,?,?) "
        "ON CONFLICT(id) DO UPDATE SET name=excluded.name,level=excluded.level,"
        "language=excluded.language,goal=excluded.goal",
        (student_id, name, level, language, goal, now()),
    )
    conn.commit()
    conn.close()


def get_student(student_id):
    conn = get_conn()
    row = conn.execute("SELECT * FROM students WHERE id=?", (student_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def create_session(session_id, student_id, subject, topic, lesson):
    conn = get_conn()
    conn.execute(
        "INSERT INTO sessions(id,student_id,subject,topic,previous_interaction_id,lesson_json,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?,?)",
        (session_id, student_id, subject, topic, None, json.dumps(lesson, ensure_ascii=False), now(), now()),
    )
    conn.commit()
    conn.close()


def get_session(session_id):
    conn = get_conn()
    row = conn.execute("SELECT * FROM sessions WHERE id=?", (session_id,)).fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["lesson"] = json.loads(d["lesson_json"] or "{}")
    return d


def update_session(session_id, previous_interaction_id=None, lesson=None):
    conn = get_conn()
    if lesson is None:
        conn.execute(
            "UPDATE sessions SET previous_interaction_id=?,updated_at=? WHERE id=?",
            (previous_interaction_id, now(), session_id),
        )
    else:
        conn.execute(
            "UPDATE sessions SET previous_interaction_id=?,lesson_json=?,updated_at=? WHERE id=?",
            (previous_interaction_id, json.dumps(lesson, ensure_ascii=False), now(), session_id),
        )
    conn.commit()
    conn.close()


def add_message(session_id, sender, text, metadata=None):
    conn = get_conn()
    conn.execute(
        "INSERT INTO messages(session_id,sender,text,metadata_json,created_at) VALUES(?,?,?,?,?)",
        (session_id, sender, text, json.dumps(metadata or {}, ensure_ascii=False), now()),
    )
    conn.commit()
    conn.close()


def get_messages(session_id, limit=200):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM messages WHERE session_id=? ORDER BY id DESC LIMIT ?",
        (session_id, limit),
    ).fetchall()
    conn.close()
    return [dict(r) for r in reversed(rows)]


def update_progress(student_id, topic, mastery, misconception=None):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM progress WHERE student_id=? AND topic=?",
        (student_id, topic),
    ).fetchone()
    if row:
        old = json.loads(row["misconceptions_json"] or "[]")
        if misconception and misconception not in old:
            old.append(misconception)
        attempts = row["attempts"] + 1
        mastery = max(0.0, min(1.0, 0.65 * row["mastery"] + 0.35 * mastery))
        conn.execute(
            "UPDATE progress SET mastery=?,attempts=?,misconceptions_json=?,updated_at=? "
            "WHERE student_id=? AND topic=?",
            (mastery, attempts, json.dumps(old[-10:], ensure_ascii=False), now(), student_id, topic),
        )
    else:
        mis = [misconception] if misconception else []
        conn.execute(
            "INSERT INTO progress(student_id,topic,mastery,attempts,misconceptions_json,updated_at) "
            "VALUES(?,?,?,?,?,?)",
            (student_id, topic, max(0.0, min(1.0, mastery)), 1, json.dumps(mis, ensure_ascii=False), now()),
        )
    conn.commit()
    conn.close()


def get_progress(student_id):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM progress WHERE student_id=? ORDER BY mastery ASC", (student_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_user_by_email(email):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM users WHERE lower(email)=lower(?)", (email,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_id(user_id):
    conn = get_conn()
    row = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def create_user(user_id, full_name, email, password_hash, level="beginner", language="English"):
    conn = get_conn()
    conn.execute(
        "INSERT INTO users(id,full_name,email,password_hash,level,language,created_at) "
        "VALUES(?,?,?,?,?,?,?)",
        (user_id, full_name, email, password_hash, level, language, now()),
    )
    conn.commit()
    conn.close()


def create_auth_token(user_id, token, expires_at):
    conn = get_conn()
    conn.execute("INSERT INTO auth_tokens(token,user_id,created_at,expires_at) VALUES(?,?,?,?)",
                 (token, user_id, now(), expires_at))
    conn.commit()
    conn.close()

def get_user_by_token(token):
    conn = get_conn()
    row = conn.execute("""
        SELECT u.* FROM users u
        JOIN auth_tokens t ON t.user_id=u.id
        WHERE t.token=? AND t.expires_at > ?
    """, (token, now())).fetchone()
    conn.close()
    return dict(row) if row else None

def delete_auth_token(token):
    conn = get_conn()
    conn.execute("DELETE FROM auth_tokens WHERE token=?", (token,))
    conn.commit()
    conn.close()
