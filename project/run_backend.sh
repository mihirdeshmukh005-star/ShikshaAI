#!/bin/sh
set -e
cd "$(dirname "$0")/backend"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
. .venv/bin/activate
python -m pip install -r requirements.txt
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created backend/.env. Add your GEMINI_API_KEY, then run this script again."
  exit 0
fi
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
