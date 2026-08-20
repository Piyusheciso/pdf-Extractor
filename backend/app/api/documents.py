from fastapi import APIRouter, Depends, HTTPException, status

from app.security.authentication import get_current_user

from app.services.document_service import (
    delete_user_document,
    get_user_document,
    get_user_documents,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


# --------------------------------------------------
# List user's documents
# --------------------------------------------------

@router.get("")
def list_documents(
    current_user: dict = Depends(get_current_user),
):
    user_id = str(current_user["_id"])

    documents = get_user_documents(
        user_id=user_id
    )

    return {
        "success": True,
        "count": len(documents),
        "documents": [
            {
                "id": str(document["_id"]),
                "filename": document["filename"],
                "file_size": document["file_size"],
                "page_count": document["page_count"],
                "status": document.get(
                    "status",
                    "success",
                ),
                "created_at": document.get(
                    "created_at"
                ),
            }
            for document in documents
        ],
    }


# --------------------------------------------------
# Get one document
# --------------------------------------------------

@router.get("/{document_id}")
def get_document(
    document_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = str(current_user["_id"])

    document = get_user_document(
        user_id=user_id,
        document_id=document_id,
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    return {
        "success": True,
        "document": {
            "id": str(document["_id"]),
            "filename": document["filename"],
            "file_size": document["file_size"],
            "page_count": document["page_count"],
            "status": document.get(
                "status",
                "success",
            ),
            "data": document.get(
                "data",
                {},
            ),
            "created_at": document.get(
                "created_at"
            ),
        },
    }


# --------------------------------------------------
# Delete one document
# --------------------------------------------------

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = str(current_user["_id"])

    deleted = delete_user_document(
        user_id=user_id,
        document_id=document_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    return {
        "success": True,
        "message": "Document deleted successfully.",
    }