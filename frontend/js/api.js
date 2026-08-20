async function apiRequest(endpoint, options = {}) {

    const token =
        localStorage.getItem("access_token");

    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers["Authorization"] =
            `Bearer ${token}`;
    }

    const url =
        `${API_BASE_URL}${endpoint}`;

    console.log("API Request:", url);

    const response = await fetch(
        url,
        {
            ...options,
            headers
        }
    );

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (response.status === 401) {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.href =
            "./index.html";

        return;
    }

    if (!response.ok) {

        const message =
            data?.detail ||
            data?.error?.message ||
            `Request failed with status ${response.status}.`;

        throw new Error(message);
    }

    return data;
}