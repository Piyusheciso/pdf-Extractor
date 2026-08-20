document.addEventListener(
    "DOMContentLoaded",
    async () => {

        requireAuth();

        await loadDocuments();
    }
);


async function loadDocuments() {

    const container =
        document.getElementById(
            "documents-container"
        );


    try {

        const response =
            await apiRequest(
                "/api/v1/documents/"
            );


        const documents =
            response.documents || [];


        if (!documents.length) {

            container.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No documents yet
                    </h3>

                    <p>
                        Upload a PDF from the
                        dashboard to get started.
                    </p>

                    <a
                        href="./dashboard.html"
                        class="button"
                    >
                        Go to Dashboard
                    </a>

                </div>
            `;

            return;
        }


        container.innerHTML =
            documents
                .map(
                    document => `
                        <div class="document-row">

                            <div class="document-info">

                                <strong>
                                    ${escapeHtml(
                                        document.filename
                                    )}
                                </strong>

                                <span>
                                    ${Number(
                                        document.page_count || 0
                                    )}
                                    pages
                                    ·
                                    ${formatBytes(
                                        document.file_size
                                    )}
                                </span>

                            </div>


                            <div class="document-actions">

                                <a
                                    href="./document.html?id=${encodeURIComponent(
                                        document.id
                                    )}"
                                    class="button small-button"
                                >
                                    View
                                </a>

                                <button
                                    class="button small-button delete-button"
                                    data-id="${escapeHtml(
                                        document.id
                                    )}"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    `
                )
                .join("");


        setupDeleteButtons();


    } catch (error) {

        console.error(
            "Failed to load documents:",
            error
        );


        container.innerHTML = `
            <div class="error">
                ${escapeHtml(
                    error.message
                )}
            </div>
        `;
    }
}


function setupDeleteButtons() {

    const buttons =
        document.querySelectorAll(
            ".delete-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const documentId =
                        button.dataset.id;


                    const confirmed =
                        confirm(
                            "Are you sure you want to delete this document?"
                        );


                    if (!confirmed) {

                        return;
                    }


                    try {

                        await apiRequest(
                            `/api/v1/documents/${encodeURIComponent(
                                documentId
                            )}`,
                            {
                                method: "DELETE"
                            }
                        );


                        await loadDocuments();


                    } catch (error) {

                        alert(
                            error.message
                        );
                    }
                }
            );
        }
    );
}


function formatBytes(bytes) {

    if (!bytes || bytes <= 0) {

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