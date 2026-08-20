document.addEventListener(
    "DOMContentLoaded",
    async () => {

        requireAuth();

        await loadDocument();
    }
);


async function loadDocument() {

    const loading =
        document.getElementById("loading");

    const errorBox =
        document.getElementById("error");

    const content =
        document.getElementById("document-content");


    const params =
        new URLSearchParams(
            window.location.search
        );


    const documentId =
        params.get("id");


    if (!documentId) {

        showError(
            "Document ID is missing."
        );

        loading.classList.add("hidden");

        return;
    }


    try {

        const response =
            await apiRequest(
                `/api/v1/documents/${encodeURIComponent(
                    documentId
                )}`
            );


        /*
         * Backend response:
         *
         * {
         *     success: true,
         *     document: {...}
         * }
         */

        const documentData =
            response.document;


        if (!documentData) {

            throw new Error(
                "Document data was not returned by the server."
            );
        }


        /*
         * Document name
         */

        const documentName =
            document.getElementById(
                "document-name"
            );


        documentName.textContent =
            documentData.filename ||
            "Untitled PDF";


        /*
         * Metadata
         */

        const documentMeta =
            document.getElementById(
                "document-meta"
            );


        const pageCount =
            Number(
                documentData.page_count || 0
            );


        const fileSize =
            Number(
                documentData.file_size || 0
            );


        const status =
            documentData.status ||
            "unknown";


        documentMeta.innerHTML = `
            <div class="document-meta">

                <div>
                    <strong>File:</strong>
                    ${escapeHtml(
                        documentData.filename ||
                        "Unknown"
                    )}
                </div>

                <div>
                    <strong>Pages:</strong>
                    ${pageCount}
                </div>

                <div>
                    <strong>Size:</strong>
                    ${formatBytes(fileSize)}
                </div>

                <div>
                    <strong>Status:</strong>
                    ${escapeHtml(status)}
                </div>

            </div>
        `;


        /*
         * Extracted data
         */

        displayPages(
            documentData.data
        );


        /*
         * Show content
         */

        loading.classList.add(
            "hidden"
        );

        content.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Failed to load document:",
            error
        );


        loading.classList.add(
            "hidden"
        );


        showError(
            error.message ||
            "Failed to load document."
        );
    }
}


function displayPages(data) {

    const container =
        document.getElementById(
            "pages-container"
        );


    if (
        !data ||
        typeof data !== "object" ||
        Object.keys(data).length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    No extracted data found
                </h3>

                <p>
                    This document does not contain
                    extracted text.
                </p>

            </div>
        `;

        return;
    }


    const pages =
        Object.entries(data);


    container.innerHTML =
        pages
            .map(
                ([pageKey, pageData], index) => {

                    let text = "";


                    if (
                        pageData &&
                        typeof pageData === "object"
                    ) {

                        text =
                            pageData.text ||
                            "";
                    }

                    else if (
                        typeof pageData === "string"
                    ) {

                        text =
                            pageData;
                    }


                    return `
                        <div class="page-card">

                            <div class="page-header">

                                <h3>
                                    Page ${index + 1}
                                </h3>

                                <span>
                                    ${escapeHtml(
                                        pageKey
                                    )}
                                </span>

                            </div>

                            <div class="page-text">

                                ${
                                    text
                                        ? escapeHtml(text)
                                        : "No text extracted from this page."
                                }

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


function showError(message) {

    const errorBox =
        document.getElementById(
            "error"
        );


    errorBox.textContent =
        message;


    errorBox.classList.remove(
        "hidden"
    );
}


function formatBytes(bytes) {

    if (
        !bytes ||
        bytes <= 0
    ) {

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


function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value == null
            ? ""
            : String(value);


    return div.innerHTML;
}