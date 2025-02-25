document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("authForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        console.log("Sending request:", { username, password });

        if (!username || !password) {
            document.getElementById("errorMessage").textContent = "Please enter both fields.";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/auth/students/signin", {
                method: "POST", // Ensure this is a POST request
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            console.log("Response received:", data);

            if (response.ok) {
                alert("Login successful!");
                window.location.href = "/dashboard.html";
            } else {
                document.getElementById("errorMessage").textContent = data.error;
            }
        } catch (error) {
            console.error("Login failed:", error);
            document.getElementById("errorMessage").textContent = "An error occurred. Please try again.";
        }
    });
});
