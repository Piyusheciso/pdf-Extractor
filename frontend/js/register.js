document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("register-form");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput =
        document.getElementById("confirm-password");

    const errorBox =
        document.getElementById("register-error");

    const successBox =
        document.getElementById("register-success");

    const registerButton =
        document.getElementById("register-button");


    form.addEventListener("submit", async (event) => {

        event.preventDefault();


        errorBox.textContent = "";
        errorBox.classList.add("hidden");

        successBox.textContent = "";
        successBox.classList.add("hidden");


        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword =
            confirmPasswordInput.value;


        /*
         * Validate passwords
         */

        if (password !== confirmPassword) {

            errorBox.textContent =
                "Passwords do not match.";

            errorBox.classList.remove("hidden");

            return;
        }


        if (password.length < 8) {

            errorBox.textContent =
                "Password must be at least 8 characters.";

            errorBox.classList.remove("hidden");

            return;
        }


        /*
         * Disable button
         */

        registerButton.disabled = true;

        registerButton.textContent =
            "Creating account...";


        try {

            /*
             * Call backend
             */

            const response = await apiRequest(
                "/api/v1/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


            /*
             * Store authentication data
             */

            if (response.access_token) {

                localStorage.setItem(
                    "access_token",
                    response.access_token
                );
            }


            if (response.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(response.user)
                );
            }


            /*
             * Success
             */

            successBox.textContent =
                "Account created successfully.";

            successBox.classList.remove("hidden");


            /*
             * Redirect
             */

            setTimeout(() => {

                window.location.href =
                    "./index.html";

            }, 1000);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            errorBox.textContent =
                error.message ||
                "Registration failed. Please try again.";

            errorBox.classList.remove("hidden");


        } finally {

            registerButton.disabled = false;

            registerButton.textContent =
                "Create Account";
        }

    });

});