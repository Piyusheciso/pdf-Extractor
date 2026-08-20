let selectedFile = null;
let extractionResult = null;


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        requireAuth();

        setupUpload();

        await loadDashboard();
    }
);


async function loadDashboard() {

    const user =
        getUser();

    const welcome =
        document.getElementById(
            "welcome-message"
        );

    if (user && welcome) {

        welcome.textContent =
            `Welcome, ${user.name}`;
    }


    try {

        const data =
            await apiRequest(
                "/api/v1/documents"
            );

        const documents =
            data.documents || [];

        updateStats(
            documents
        );

        displayRecentDocuments(
            documents
        );

    } catch (error) {

        console.error(error);

        const container =
            document.getElementById(
                "recent-documents"
            );

        container.innerHTML = `
            <p class="error">
                ${escapeHtml(error.message)}
            </p>
        `;
    }
}


function updateStats(
    documents
) {

    const documentCount =
        document.getElementById(
            "document-count"
        );

    const pageCount =
        document.getElementById(
            "page-count"
        );


    const totalPages =
        documents.reduce(
            (total, document) =>
                total +
                Number(
                    document.page_count || 0
                ),
            0
        );


    documentCount.textContent =
        documents.length;

    pageCount.textContent =
        totalPages;
}


function displayRecentDocuments(
    documents
) {

    const container =
        document.getElementById(
            "recent-documents"
        );


    if (!documents.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No documents yet</h3>
                <p>
                    Upload your first PDF to
                    get started.
                </p>
            </div>
        `;

        return;
    }


    const recent =
        documents.slice(0, 5);


    container.innerHTML =
        recent.map(
            document => `
                <div class="document-row">

                    <div>

                        <strong>
                            ${escapeHtml(
                                document.filename
                            )}
                        </strong>

                        <span>
                            ${document.page_count}
                            pages
                            ·
                            ${formatBytes(
                                document.file_size
                            )}
                        </span>

                    </div>

                    <a
                        href="./document.html?id=${encodeURIComponent(
                            document.id
                        )}"
                        class="button small-button"
                    >
                        View
                    </a>

                </div>
            `
        ).join("");
}


function setupUpload() {

    const fileInput =
        document.getElementById(
            "file-input"
        );

    const dropZone =
        document.getElementById(
            "drop-zone"
        );

    const removeButton =
        document.getElementById(
            "remove-file"
        );

    const extractButton =
        document.getElementById(
            "extract-button"
        );


    fileInput.addEventListener(
        "change",
        () => {

            if (
                fileInput.files &&
                fileInput.files.length
            ) {

                selectFile(
                    fileInput.files[0]
                );
            }
        }
    );


    removeButton.addEventListener(
        "click",
        clearFile
    );


    extractButton.addEventListener(
        "click",
        extractPDF
    );


    dropZone.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

            dropZone.classList.add(
                "dragging"
            );
        }
    );


    dropZone.addEventListener(
        "dragleave",
        () => {

            dropZone.classList.remove(
                "dragging"
            );
        }
    );


    dropZone.addEventListener(
        "drop",
        event => {

            event.preventDefault();

            dropZone.classList.remove(
                "dragging"
            );

            const files =
                event.dataTransfer.files;

            if (files.length) {

                selectFile(
                    files[0]
                );
            }
        }
    );
}


function selectFile(file) {

    hideMessages();


    if (
        file.type !==
        "application/pdf"
    ) {

        showError(
            "Only PDF files are allowed."
        );

        return;
    }


    const maxSize =
        5 * 1024 * 1024;


    if (file.size > maxSize) {

        showError(
            "PDF size must not exceed 5 MB."
        );

        return;
    }


    if (file.size === 0) {

        showError(
            "The selected PDF is empty."
        );

        return;
    }


    selectedFile = file;


    document
        .getElementById("file-name")
        .textContent =
        file.name;


    document
        .getElementById("file-size")
        .textContent =
        formatBytes(file.size);


    document
        .getElementById("file-info")
        .classList.remove(
            "hidden"
        );


    document
        .getElementById("extract-button")
        .classList.remove(
            "hidden"
        );
}


function clearFile() {

    selectedFile = null;

    document
        .getElementById("file-input")
        .value = "";


    document
        .getElementById("file-info")
        .classList.add(
            "hidden"
        );


    document
        .getElementById("extract-button")
        .classList.add(
            "hidden"
        );


    hideMessages();
}


async function extractPDF() {

    if (!selectedFile) {

        showError(
            "Please select a PDF first."
        );

        return;
    }


    const loading =
        document.getElementById(
            "loading"
        );

    const extractButton =
        document.getElementById(
            "extract-button"
        );


    hideMessages();

    loading.classList.remove(
        "hidden"
    );

    extractButton.disabled = true;


    const formData =
        new FormData();

    formData.append(
        "file",
        selectedFile
    );


    try {

        const data =
            await apiRequest(
                "/api/v1/pdf/extract",
                {
                    method: "POST",
                    body: formData
                }
            );


        extractionResult = data;

        showSuccess(
            "PDF processed and saved successfully."
        );


        await loadDashboard();


        clearFile();


    } catch (error) {

        showError(
            error.message
        );

    } finally {

        loading.classList.add(
            "hidden"
        );

        extractButton.disabled =
            false;
    }
}


function showError(
    message
) {

    const box =
        document.getElementById(
            "error-box"
        );

    box.textContent =
        message;

    box.classList.remove(
        "hidden"
    );
}


function showSuccess(
    message
) {

    const box =
        document.getElementById(
            "success-box"
        );

    box.textContent =
        message;

    box.classList.remove(
        "hidden"
    );
}


function hideMessages() {

    document
        .getElementById("error-box")
        .classList.add(
            "hidden"
        );

    document
        .getElementById("success-box")
        .classList.add(
            "hidden"
        );
}


function formatBytes(
    bytes
) {

    if (!bytes) {
        return "0 Bytes";
    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        parseFloat(
            (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(2)
        ) +
        " " +
        units[index]
    );
}


function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value;

    return div.innerHTML;
}