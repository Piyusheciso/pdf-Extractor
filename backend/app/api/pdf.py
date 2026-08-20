from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import JSONResponse

from app.security.authentication import get_current_user

from app.services.document_service import save_document

from app.services.pdf_extractor import (
    PDFExtractionError,
    PDFExtractor,
)

from app.validators.pdf_validator import (
    PDFValidationError,
    PDFValidator,
)


router = APIRouter(
    prefix="/pdf",
    tags=["PDF"],
)


@router.post("/extract")
async def extract_pdf(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a PDF, extract text page-by-page,
    and store only the extracted data in MongoDB.
    """

    # --------------------------------------------------
    # 1. Validate PDF
    # --------------------------------------------------

    try:
        file_data = await PDFValidator.validate(file)

    except PDFValidationError as exc:

        status_code = 400

        if exc.code == "FILE_TOO_LARGE":
            status_code = 413

        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                },
            },
        )

    # --------------------------------------------------
    # 2. Extract PDF
    # --------------------------------------------------

    try:
        extraction_result = PDFExtractor.extract(file_data)

    except PDFExtractionError as exc:

        status_code = 422

        if exc.code == "EXTRACTION_FAILED":
            status_code = 500

        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                },
            },
        )

    # --------------------------------------------------
    # 3. Prepare metadata
    # --------------------------------------------------

    file_size = len(file_data)

    size_mb = round(
        file_size / (1024 * 1024),
        3,
    )

    filename = file.filename or "unknown.pdf"

    page_count = extraction_result["page_count"]

    extracted_data = extraction_result["pages"]

    # --------------------------------------------------
    # 4. Save extracted data to MongoDB
    # --------------------------------------------------

    saved_document = save_document(
        user_id=str(current_user["_id"]),
        filename=filename,
        file_size=file_size,
        page_count=page_count,
        data=extracted_data,
    )

    # --------------------------------------------------
    # 5. Return response
    # --------------------------------------------------

    return {
        "success": True,
        "message": "PDF processed successfully.",
        "document_id": str(saved_document["_id"]),
        "file": {
            "filename": filename,
            "size_bytes": file_size,
            "size_mb": size_mb,
            "page_count": page_count,
        },
        "extraction": {
            "method": "pymupdf",
            "text_extracted": extraction_result["text_extracted"],
        },
        "data": extracted_data,
    }


@router.get("/status")
async def pdf_status():
    return {
        "status": "ready",
        "service": "pdf-extractor",
    }