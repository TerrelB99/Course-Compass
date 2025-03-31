document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const userType = document.getElementById("userType");
    const companyField = document.getElementById("company");
    const errorMessage = document.getElementById("errorMessage");

    if (!signupForm || !userType || !companyField || !errorMessage) {
        console.error("One or more elements not found in the DOM.");
        return;
    }

    userType.addEventListener("change", () => {
        if (userType.value === "counselor") {
            companyField.style.display = "block";
            companyField.setAttribute("required", "required");
        } else {
            companyField.style.display = "none";
            companyField.removeAttribute("required");
        }
    });

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const firstname = document.getElementById("firstname")?.value.trim();
        const lastname = document.getElementById("lastname")?.value.trim();
        const username = document.getElementById("username")?.value.trim();
        const password = document.getElementById("password")?.value.trim();
        const major = document.getElementById("major")?.value.trim() || "None";

        if (!firstname || !lastname || !username || !password || !major) {
            errorMessage.textContent = "All fields are required!";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/counselor/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstname, lastname, username, password, major }),
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
