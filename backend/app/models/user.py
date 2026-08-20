from datetime import datetime, timezone

from bson import ObjectId


def create_user_document(
    name: str,
    email: str,
    password_hash: str,
) -> dict:
    now = datetime.now(timezone.utc)

    return {
        "_id": ObjectId(),
        "name": name,
        "email": email.lower(),
        "password_hash": password_hash,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }