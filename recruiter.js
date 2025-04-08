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
                    // ✅ Store the full recruiter data for messaging access
                    sessionStorage.setItem("recruiter", JSON.stringify({
                        _id: data.user.recruiterId,
                        username: data.user.username,
                        messageSenderID: data.user.messageSenderID,
                        messageReceiverID: data.user.messageReceiverID
                    }));

                    // ✅ Store recruiterID in localStorage for other components if needed
                    localStorage.setItem("recruiterID", data.user.recruiterId);

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
