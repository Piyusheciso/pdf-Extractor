from pathlib import Path

from fastapi import UploadFile

from app.config import settings


class PDFValidationError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


class PDFValidator:
    ALLOWED_EXTENSION = ".pdf"
    PDF_SIGNATURE = b"%PDF-"

    @staticmethod
    async def validate(upload_file: UploadFile) -> bytes:
        """
        Validate the uploaded PDF and return its contents.
        """

        # 1. Check file exists
        if upload_file is None:
            raise PDFValidationError(
                "FILE_REQUIRED",
                "PDF file is required.",
            )

        # 2. Check filename
        filename = upload_file.filename or ""

        if not filename:
            raise PDFValidationError(
                "INVALID_FILENAME",
                "A valid PDF filename is required.",
            )

        # 3. Check extension
        if Path(filename).suffix.lower() != PDFValidator.ALLOWED_EXTENSION:
            raise PDFValidationError(
                "INVALID_FILE_TYPE",
                "Only PDF files are allowed.",
            )

        # 4. Read file
        file_data = await upload_file.read()

        if not file_data:
            raise PDFValidationError(
                "EMPTY_FILE",
                "The uploaded PDF is empty.",
            )

        # 5. Check size
        file_size = len(file_data)

        if file_size > settings.max_file_size_bytes:
            raise PDFValidationError(
                "FILE_TOO_LARGE",
                f"PDF size must not exceed "
                f"{settings.max_file_size_mb} MB.",
            )

        # 6. Check PDF signature
        if not file_data.startswith(PDFValidator.PDF_SIGNATURE):
            raise PDFValidationError(
                "INVALID_PDF",
                "The uploaded file is not a valid PDF.",
            )

        # Reset file position
        await upload_file.seek(0)

        return file_data