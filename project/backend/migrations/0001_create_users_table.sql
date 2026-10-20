-- Migration 0001: create the `users` table used for registration/login.
--
-- Applied automatically on backend startup via app.db.init_db(), and can
-- also be applied explicitly by running `python migrate.py` from backend/.
-- This file is the authoritative record of the schema for review/history;
-- init_db() executes the equivalent statements idempotently (CREATE TABLE
-- IF NOT EXISTS) so re-running it never touches existing data.

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,               -- UUID4, generated at registration time
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,        -- stored lowercase, enforced unique
    password_hash TEXT NOT NULL,       -- PBKDF2-HMAC-SHA256, never plaintext
    level TEXT DEFAULT 'beginner',
    language TEXT DEFAULT 'English',
    created_at TEXT NOT NULL           -- ISO-8601 UTC timestamp
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
