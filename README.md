# PDF Extractor

A full-stack PDF extraction application that allows users to register, authenticate, upload PDF documents, extract text page-by-page, and store the extracted data for later viewing.

The project consists of a **FastAPI backend**, **MongoDB database**, and a lightweight **HTML/CSS/JavaScript frontend**.

---

## Features

- User registration
- User login
- JWT-based authentication
- Protected API endpoints
- PDF upload
- PDF validation
- PDF text extraction
- Page-by-page extraction
- Extracted data stored in MongoDB
- Document history
- View extracted documents
- Delete saved documents
- Dashboard statistics
- Drag-and-drop PDF upload
- Swagger API documentation
- CORS support
- 5 MB PDF upload limit

---

## Project Architecture

```text
PDF Extractor
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── documents.py
│   │   │   └── pdf.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   └── document.py
│   │   │
│   │   ├── schemas/
│   │   │   └── auth.py
│   │   │
│   │   ├── security/
│   │   │   ├── authentication.py
│   │   │   └── jwt.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   └── document_service.py
│   │   │
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── documents.html
│   ├── document.html
│   ├── documentation.html
│   ├── register.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   └── dashboard.css
│   │
│   └── js/
│       ├── config.js
│       ├── api.js
│       ├── auth.js
│       ├── login.js
│       ├── register.js
│       ├── dashboard.js
│       └── document.js
│
└── README.md
