document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("authForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim(); // Trim to avoid space issues

        console.log("Sending request:", { username, password });

        if (!username || !password) {
            document.getElementById("errorMessage").textContent = "Please enter both fields.";
            return;
        }

        try {
            // Send login request
            const response = await fetch("http://localhost:3000/student/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            console.log("Response received:", data);

            if (response.ok) {
                alert("Login successful!");

                // Store user data in session storage
                sessionStorage.setItem("student", JSON.stringify(data.student));

                // Redirect to student dashboard or another page
                window.location.href = "student_navigator.html";
            } else {
                document.getElementById("errorMessage").textContent = data.message;
            }
        } catch (error) {
            console.error("Login failed:", error);
            document.getElementById("errorMessage").textContent = "An error occurred. Please try again.";
        }
    });
});
