"""Password hashing helpers.

Uses PBKDF2-HMAC-SHA256 from Python's standard library so no extra native
dependency (e.g. bcrypt) is required. Each password gets a unique random
salt; the iteration count is stored alongside the hash so it can be safely
increased later without breaking verification of older hashes.
"""

import hashlib
import hmac
import secrets

_ALGORITHM = "pbkdf2_sha256"
_ITERATIONS = 260_000


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), _ITERATIONS)
    return f"{_ALGORITHM}${_ITERATIONS}${salt}${digest.hex()}"


def verify_password(password: str, encoded_hash: str) -> bool:
    try:
        algorithm, iterations, salt, hash_hex = encoded_hash.split("$")
        iterations = int(iterations)
    except (ValueError, AttributeError):
        return False
    if algorithm != _ALGORITHM:
        return False
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), iterations)
    return hmac.compare_digest(candidate.hex(), hash_hex)
