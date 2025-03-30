document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("authForm");

    // ✅ Check if recruiter is already logged in
    const storedRecruiter = sessionStorage.getItem("recruiter");
    if (storedRecruiter) {
        window.location.href = "recruiter_dashboard.html";
        return;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!username || !password) {
                alert("Please enter both username and password.");
                return;
            }

            try {
                const response = await fetch("/recruiter/signin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    sessionStorage.setItem("recruiter", JSON.stringify(data));
                    localStorage.setItem("recruiterID", data._id); // ✅ Ensure correct ID storage
                    window.location.href = "recruiter_dashboard.html"; // Redirect after login
                } else {
                    alert(data.message);
                }

            } catch (error) {
                console.error("Login error:", error);
                alert("An error occurred. Please try again.");
            }
        });
    }
});
