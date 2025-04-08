document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("authForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            document.getElementById("errorMessage").textContent = "Please enter both fields.";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/student/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem("student", JSON.stringify(data.user));
                localStorage.setItem("studentID", data.user._id); // ✅ Store MongoDB `_id`
                localStorage.setItem("studentSenderID", data.user.messageSenderID);
                localStorage.setItem("studentReceiverID", data.user.messageReceiverID);
                sessionStorage.setItem("student", JSON.stringify(data.user));

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
