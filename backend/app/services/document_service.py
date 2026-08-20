from bson import ObjectId

from app.database import documents_collection
from app.models.document import create_document


def save_document(
    user_id: str,
    filename: str,
    file_size: int,
    page_count: int,
    data: dict,
):
    document = create_document(
        user_id=user_id,
        filename=filename,
        file_size=file_size,
        page_count=page_count,
        data=data,
    )

    result = documents_collection.insert_one(
        document
    )

    document["_id"] = result.inserted_id

    return document


def get_user_documents(
    user_id: str,
):
    return list(
        documents_collection.find(
            {
                "user_id": user_id
            }
        ).sort(
            "created_at",
            -1,
        )
    )


def get_user_document(
    user_id: str,
    document_id: str,
):
    if not ObjectId.is_valid(
        document_id
    ):
        return None

    return documents_collection.find_one(
        {
            "_id": ObjectId(document_id),
            "user_id": user_id,
        }
    )


def delete_user_document(
    user_id: str,
    document_id: str,
):
    if not ObjectId.is_valid(
        document_id
    ):
        return False

    result = documents_collection.delete_one(
        {
            "_id": ObjectId(document_id),
            "user_id": user_id,
        }
    )

    return result.deleted_count > 0