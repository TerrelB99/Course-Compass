document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const errorMessage = document.getElementById("errorMessage");

    if (!signupForm || !errorMessage) {
        console.error("Form or error message element not found.");
        return;
    }

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const firstName = document.getElementById("firstName")?.value.trim();
        const lastName = document.getElementById("lastName")?.value.trim();
        const username = document.getElementById("username")?.value.trim();
        const password = document.getElementById("password")?.value.trim();
        const university = document.getElementById("university")?.value.trim();
        const major = document.getElementById("major")?.value.trim() || "None";

        if (!firstName || !lastName || !username || !password || !major || !university) {
            errorMessage.textContent = "All fields are required!";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/counselor/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, username, password, major, university }),
            });

            if (response.ok) {
                alert("Signup successful! Redirecting to sign-in...");
                window.location.href = "counselorSignIn.html";
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
