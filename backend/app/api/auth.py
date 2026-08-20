from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
)

from app.security.authentication import get_current_user
from app.security.jwt import create_access_token

from app.services.auth_service import (
    authenticate_user,
    create_user,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(data: RegisterRequest):

    user = create_user(
        name=data.name,
        email=str(data.email),
        password=data.password,
    )

    token = create_access_token(
        str(user["_id"])
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
        },
    }


@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(data: LoginRequest):

    user = authenticate_user(
        email=str(data.email),
        password=data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(
        str(user["_id"])
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
        },
    }


@router.get("/me")
def get_me(
    current_user: dict = Depends(get_current_user),
):
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
    }