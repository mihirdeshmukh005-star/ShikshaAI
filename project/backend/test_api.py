# Quick smoke test after starting the server:
# python test_api.py
import urllib.request, json

base="http://127.0.0.1:8000"

with urllib.request.urlopen(base + "/api/health") as r:
    print(json.loads(r.read()))

payload=json.dumps({
    "student_id":"demo-student",
    "subject":"Physics",
    "topic":"Newton's Laws of Motion"
}).encode()

req=urllib.request.Request(
    base + "/api/sessions/start",
    data=payload,
    headers={"Content-Type":"application/json"},
    method="POST",
)

with urllib.request.urlopen(req) as r:
    data=json.loads(r.read())
    print("Session:", data["session_id"])
