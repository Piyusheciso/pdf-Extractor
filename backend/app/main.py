from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth
from app.api import documents
from app.api import pdf
from app.config import settings

from app.database import (
    connect_to_database,
    close_database_connection,
)


# ==================================================
# FastAPI Application
# ==================================================

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "API for validating PDF files, "
        "extracting text page-by-page, "
        "and storing extracted data."
    ),
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5000",
        "http://localhost:5000",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# Database Startup / Shutdown
# ==================================================

@app.on_event("startup")
def startup():
    connect_to_database()


@app.on_event("shutdown")
def shutdown():
    close_database_connection()


# ==================================================
# API Routes
# ==================================================

# Authentication
#
# /api/v1/auth/register
# /api/v1/auth/login
# /api/v1/auth/me
#
app.include_router(
    auth.router,
    prefix="/api/v1",
)


# PDF
#
# /api/v1/pdf/extract
# /api/v1/pdf/status
#
app.include_router(
    pdf.router,
    prefix="/api/v1",
)


# Documents
#
# /api/v1/documents/...
#
app.include_router(
    documents.router,
    prefix="/api/v1",
)


# ==================================================
# Root
# ==================================================

@app.get("/")
async def root():
    return {
        "success": True,
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running",
    }


# ==================================================
# Health Check
# ==================================================

@app.get("/health")
async def health():
    return {
        "success": True,
        "status": "healthy",
    }