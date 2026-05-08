from __future__ import annotations

try:
    import bcrypt
except ImportError:  # Local fallback until requirements are installed.
    bcrypt = None
    from werkzeug.security import check_password_hash, generate_password_hash


def hash_password(password: str) -> str:
    if bcrypt is None:
        return generate_password_hash(password, method="pbkdf2:sha256", salt_length=16)
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    if not password or not password_hash:
        return False
    if bcrypt is None:
        return check_password_hash(password_hash, password)
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False
