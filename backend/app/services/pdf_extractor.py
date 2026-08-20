import pymupdf

from app.config import settings


class PDFExtractionError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


class PDFExtractor:

    @staticmethod
    def extract(file_data: bytes) -> dict:
        """
        Open the PDF and extract text page-by-page.
        """

        try:
            document = pymupdf.open(
                stream=file_data,
                filetype="pdf",
            )

        except Exception as exc:
            raise PDFExtractionError(
                "INVALID_PDF",
                "The PDF could not be opened or read.",
            ) from exc

        try:
            # Check page count
            page_count = len(document)

            if page_count == 0:
                raise PDFExtractionError(
                    "EMPTY_PDF",
                    "The PDF contains no pages.",
                )

            if page_count > settings.max_page_count:
                raise PDFExtractionError(
                    "TOO_MANY_PAGES",
                    f"PDF cannot contain more than "
                    f"{settings.max_page_count} pages.",
                )

            pages = {}
            text_found = False

            for page_index in range(page_count):

                page_number = page_index + 1

                page = document.load_page(page_index)

                text = page.get_text("text")

                # Normalize line endings
                text = text.replace("\r\n", "\n")
                text = text.replace("\r", "\n")

                # Remove unnecessary trailing whitespace
                text = text.strip()

                if text:
                    text_found = True

                pages[f"page_{page_number}"] = {
                    "page_number": page_number,
                    "text": text,
                }

            if not text_found:
                raise PDFExtractionError(
                    "NO_TEXT_FOUND",
                    "The PDF was readable, but no "
                    "extractable text was found.",
                )

            return {
                "page_count": page_count,
                "pages": pages,
                "text_extracted": True,
            }

        except PDFExtractionError:
            raise

        except Exception as exc:
            raise PDFExtractionError(
                "EXTRACTION_FAILED",
                "An error occurred while extracting "
                "text from the PDF.",
            ) from exc

        finally:
            document.close()