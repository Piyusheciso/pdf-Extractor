from fastapi import HTTPException, status

from app.database import users_collection
from app.models.user import create_user_document
from app.security.password import (
    hash_password,
    verify_password,
)


def create_user(
    name: str,
    email: str,
    password: str,
) -> dict:

    normalized_email = email.lower().strip()

    existing_user = users_collection.find_one(
        {
            "email": normalized_email
        }
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered.",
        )

    password_hash = hash_password(password)

    user = create_user_document(
        name=name.strip(),
        email=normalized_email,
        password_hash=password_hash,
    )

    users_collection.insert_one(user)

    return user


def authenticate_user(
    email: str,
    password: str,
) -> dict | None:

    normalized_email = email.lower().strip()

    user = users_collection.find_one(
        {
            "email": normalized_email
        }
    )

    if not user:
        return None

    if not user.get("is_active", False):
        return None

    if not verify_password(
        password,
        user["password_hash"],
    ):
        return None

    return user