document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (isLoggedIn()) {

            window.location.href =
                "./dashboard.html";

            return;
        }

        const form =
            document.getElementById(
                "login-form"
            );

        const errorBox =
            document.getElementById(
                "login-error"
            );

        const button =
            document.getElementById(
                "login-button"
            );

        if (!form) {

            console.error(
                "Login form not found."
            );

            return;
        }

        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                errorBox.classList.add(
                    "hidden"
                );

                button.disabled = true;

                button.textContent =
                    "Logging in...";

                const email =
                    document
                        .getElementById("email")
                        .value
                        .trim();

                const password =
                    document
                        .getElementById("password")
                        .value;

                try {

                    const data =
                        await apiRequest(
                            "/api/v1/auth/login",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        email: email,
                                        password: password
                                    })
                            }
                        );

                    console.log(
                        "Login response:",
                        data
                    );

                    if (
                        !data ||
                        !data.access_token
                    ) {

                        throw new Error(
                            "No access token returned by the API."
                        );
                    }

                    saveAuth(
                        data.access_token,
                        data.user
                    );

                    window.location.href =
                        "./dashboard.html";

                } catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );

                    errorBox.textContent =
                        error.message ||
                        "Login failed.";

                    errorBox.classList.remove(
                        "hidden"
                    );

                } finally {

                    button.disabled = false;

                    button.textContent =
                        "Login";
                }
            }
        );
    }
);