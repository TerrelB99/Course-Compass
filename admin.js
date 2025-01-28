document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.getElementById("authForm");
    const errorMessage = document.getElementById("errorMessage");

    authForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        const hardcodedUsername = "adm1n4@career.compass.net";
        const hardcodedPassword = "CJ+MKd3a&AtqhY##";

        if (!username || !password) {
            errorMessage.textContent = "Both fields are required!";
            return;
        }

        if (username === hardcodedUsername && password === hardcodedPassword) {
            alert("Welcome, Admin!");
            // Redirect to admin dashboard
            window.location.href = "admin_dashboard.html";
        } else {
            errorMessage.textContent = "Invalid credentials. Please try again.";
        }
    });
});
