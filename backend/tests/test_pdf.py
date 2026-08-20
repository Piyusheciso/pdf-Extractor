from io import BytesIO

import fitz
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def create_pdf() -> bytes:
    document = fitz.open()

    page = document.new_page()

    page.insert_text(
        (72, 72),
        "Hello from PDF page 1.",
    )

    page = document.new_page()

    page.insert_text(
        (72, 72),
        "Hello from PDF page 2.",
    )

    pdf_data = document.tobytes()

    document.close()

    return pdf_data


def test_pdf_extraction():
    pdf_data = create_pdf()

    response = client.post(
        "/api/v1/pdf/extract",
        files={
            "file": (
                "test.pdf",
                BytesIO(pdf_data),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["success"] is True
    assert data["file"]["filename"] == "test.pdf"
    assert data["file"]["page_count"] == 2

    assert "page_1" in data["data"]
    assert "page_2" in data["data"]

    assert (
        "Hello from PDF page 1."
        in data["data"]["page_1"]["text"]
    )

    assert (
        "Hello from PDF page 2."
        in data["data"]["page_2"]["text"]
    )