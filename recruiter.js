document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("authForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        console.log("🔍 Sending recruiter login request:", { username, password });

        if (!username || !password) {
            document.getElementById("errorMessage").textContent = "Please enter both fields.";
            return;
        }

        try {
            // Send login request to the backend
            const response = await fetch("http://localhost:3000/recruiter/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            console.log("✅ Response received:", data);

            if (response.ok) {
                alert("Login successful!");

                // Store recruiter data in session storage
                sessionStorage.setItem("recruiter", JSON.stringify(data.user));

                // Redirect to recruiter dashboard or home page
                window.location.href = "recruiter_dashboard.html";
            } else {
                document.getElementById("errorMessage").textContent = data.message;
            }
        } catch (error) {
            console.error("❌ Login failed:", error);
            document.getElementById("errorMessage").textContent = "An error occurred. Please try again.";
        }
    });
});
