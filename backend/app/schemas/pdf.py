from typing import Dict

from pydantic import BaseModel, Field


class PageData(BaseModel):
    page_number: int = Field(..., description="PDF page number")
    text: str = Field(default="", description="Extracted text from the page")


class FileInfo(BaseModel):
    filename: str
    size_bytes: int
    size_mb: float
    page_count: int


class ExtractionInfo(BaseModel):
    method: str
    text_extracted: bool


class PDFSuccessResponse(BaseModel):
    success: bool
    message: str
    file: FileInfo
    extraction: ExtractionInfo
    data: Dict[str, PageData]


class ErrorDetails(BaseModel):
    code: str
    message: str


class PDFErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetails