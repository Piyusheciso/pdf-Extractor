function saveAuth(
    accessToken,
    user
) {
    localStorage.setItem(
        "access_token",
        accessToken
    );

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );
}


function getToken() {
    return localStorage.getItem(
        "access_token"
    );
}


function getUser() {
    const user = localStorage.getItem(
        "user"
    );

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}


function isLoggedIn() {
    return Boolean(
        localStorage.getItem("access_token")
    );
}


function logout() {
    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "user"
    );

    window.location.href =
        "./index.html";
}


async function getCurrentUser() {
    return await apiRequest(
        "/auth/me"
    );
}


function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href =
            "./index.html";
    }
}

