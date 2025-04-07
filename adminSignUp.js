document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const errorMessage = document.getElementById("errorMessage");

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const firstName = document.getElementById("firstName")?.value.trim();
        const lastName = document.getElementById("lastName")?.value.trim();
        const username = document.getElementById("username")?.value.trim();
        const password = document.getElementById("password")?.value.trim();

        if (!firstName || !lastName || !username || !password) {
            errorMessage.textContent = "All fields are required!";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/admin/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, username, password }),
            });

            if (response.ok) {
                alert("Signup successful! Redirecting to sign-in...");
                window.location.href = "adminSignIn.html";
            } else {
                const errorText = await response.json();
                errorMessage.textContent = errorText.message || "Signup failed. Please try again.";
            }
        } catch (err) {
            errorMessage.textContent = "Error connecting to the server!";
            console.error(err);
        }
    });
});
