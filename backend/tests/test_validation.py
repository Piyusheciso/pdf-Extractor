from io import BytesIO

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_missing_file():
    response = client.post(
        "/api/v1/pdf/extract"
    )

    assert response.status_code == 422


def test_invalid_extension():
    response = client.post(
        "/api/v1/pdf/extract",
        files={
            "file": (
                "test.txt",
                BytesIO(b"%PDF- fake content"),
                "text/plain",
            )
        },
    )

    assert response.status_code == 400

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_FILE_TYPE"


def test_invalid_pdf_signature():
    response = client.post(
        "/api/v1/pdf/extract",
        files={
            "file": (
                "test.pdf",
                BytesIO(b"This is not a PDF"),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 400

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_PDF"