const API_BASE_URL = "http://127.0.0.1:8000";

const API_ENDPOINT =
    `${API_BASE_URL}/api/v1/pdf/extract`;

const MAX_FILE_SIZE =
    5 * 1024 * 1024;


let selectedFile = null;

let lastResult = null;


/*
 * Elements
 */

const fileInput =
    document.getElementById("file-input");

const dropZone =
    document.getElementById("drop-zone");

const fileInfo =
    document.getElementById("file-info");

const fileName =
    document.getElementById("file-name");

const fileSize =
    document.getElementById("file-size");

const removeFile =
    document.getElementById("remove-file");

const extractButton =
    document.getElementById("extract-button");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("error-box");

const successBox =
    document.getElementById("success-box");

const resultSection =
    document.getElementById("result-section");

const resultSummary =
    document.getElementById("result-summary");

const pagesContainer =
    document.getElementById("pages-container");

const downloadJson =
    document.getElementById("download-json");


/*
 * File input
 */

fileInput.addEventListener(
    "change",
    function () {

        if (this.files.length === 0) {
            return;
        }

        handleFile(this.files[0]);
    }
);


/*
 * Drag over
 */

dropZone.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropZone.classList.add(
            "dragover"
        );
    }
);


/*
 * Drag leave
 */

dropZone.addEventListener(
    "dragleave",
    function () {

        dropZone.classList.remove(
            "dragover"
        );
    }
);


/*
 * Drop
 */

dropZone.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        dropZone.classList.remove(
            "dragover"
        );

        if (
            event.dataTransfer.files.length === 0
        ) {
            return;
        }

        handleFile(
            event.dataTransfer.files[0]
        );
    }
);


/*
 * Handle file
 */

function handleFile(file) {

    clearMessages();

    resultSection.classList.add(
        "hidden"
    );


    /*
     * Check extension
     */

    if (
        !file.name
            .toLowerCase()
            .endsWith(".pdf")
    ) {

        showError(
            "Only PDF files are allowed."
        );

        resetFile();

        return;
    }


    /*
     * Check size
     */

    if (file.size > MAX_FILE_SIZE) {

        showError(
            "PDF size must not exceed 5 MB."
        );

        resetFile();

        return;
    }


    selectedFile = file;


    fileName.textContent =
        file.name;

    fileSize.textContent =
        formatSize(file.size);


    fileInfo.classList.remove(
        "hidden"
    );

    extractButton.classList.remove(
        "hidden"
    );
}


/*
 * Remove file
 */

removeFile.addEventListener(
    "click",
    function () {

        resetFile();
    }
);


function resetFile() {

    selectedFile = null;

    fileInput.value = "";

    fileInfo.classList.add(
        "hidden"
    );

    extractButton.classList.add(
        "hidden"
    );
}


/*
 * Extract PDF
 */

extractButton.addEventListener(
    "click",
    async function () {

        if (!selectedFile) {

            showError(
                "Please select a PDF first."
            );

            return;
        }


        clearMessages();


        loading.classList.remove(
            "hidden"
        );

        extractButton.disabled = true;


        try {

            const formData =
                new FormData();

            formData.append(
                "file",
                selectedFile
            );


            const response =
                await fetch(
                    API_ENDPOINT,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data?.error?.message ||
                    "PDF processing failed."
                );
            }


            lastResult = data;


            displayResult(data);


            successBox.textContent =
                "PDF processed successfully.";

            successBox.classList.remove(
                "hidden"
            );

        }

        catch (error) {

            showError(
                error.message ||
                "Unable to connect to the API."
            );
        }

        finally {

            loading.classList.add(
                "hidden"
            );

            extractButton.disabled = false;
        }
    }
);


/*
 * Display result
 */

function displayResult(data) {

    resultSection.classList.remove(
        "hidden"
    );


    resultSummary.textContent =
        `${data.file.filename} • ` +
        `${data.file.page_count} page(s) • ` +
        `${data.file.size_mb} MB`;


    pagesContainer.innerHTML = "";


    const pages =
        data.data || {};


    Object.values(pages).forEach(
        function (page) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "page-card";


            const header =
                document.createElement(
                    "div"
                );

            header.className =
                "page-header";

            header.textContent =
                `Page ${page.page_number}`;


            const text =
                document.createElement(
                    "div"
                );

            text.className =
                "page-text";

            text.textContent =
                page.text ||
                "(No text extracted.)";


            card.appendChild(header);

            card.appendChild(text);

            pagesContainer.appendChild(card);
        }
    );


    resultSection.scrollIntoView({
        behavior: "smooth"
    });
}


/*
 * Download JSON
 */

downloadJson.addEventListener(
    "click",
    function () {

        if (!lastResult) {
            return;
        }


        const json =
            JSON.stringify(
                lastResult,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type: "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;


        const filename =
            lastResult.file.filename
                .replace(
                    /\.pdf$/i,
                    ""
                );


        link.download =
            `${filename}.json`;


        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);
    }
);


/*
 * Helpers
 */

function formatSize(bytes) {

    const mb =
        bytes / (1024 * 1024);

    return `${mb.toFixed(3)} MB`;
}


function showError(message) {

    errorBox.textContent =
        message;

    errorBox.classList.remove(
        "hidden"
    );
}


function clearMessages() {

    errorBox.textContent = "";

    successBox.textContent = "";

    errorBox.classList.add(
        "hidden"
    );

    successBox.classList.add(
        "hidden"
    );
}