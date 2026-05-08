from __future__ import annotations

import re


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ROLES = {"admin", "patient", "doctor", "nurse", "pharmacy", "emergency"}
ROLE_ALIASES = {
    "medecin": "doctor",
    "médecin": "doctor",
    "infirmier": "nurse",
    "pharmacie": "pharmacy",
    "urgence": "emergency",
}


def normalize_role(role: str) -> str:
    value = (role or "patient").strip().lower()
    value = ROLE_ALIASES.get(value, value)
    return value if value in ROLES else "patient"


def validate_email(email: str) -> bool:
    return bool(EMAIL_RE.match((email or "").strip()))


def split_name(full_name: str) -> tuple[str, str]:
    parts = [part for part in (full_name or "").strip().split() if part]
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[-1], " ".join(parts[:-1])
