from datetime import datetime, timezone


def create_document(
    user_id: str,
    filename: str,
    file_size: int,
    page_count: int,
    data: dict,
) -> dict:
    return {
        "user_id": user_id,
        "filename": filename,
        "file_size": file_size,
        "page_count": page_count,
        "status": "success",
        "data": data,
        "created_at": datetime.now(timezone.utc),
    }