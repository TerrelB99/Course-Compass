document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.getElementById("authForm");
    const errorMessage = document.getElementById("errorMessage");

    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            errorMessage.textContent = "Both fields are required!";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/student/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Welcome, ${result.student.firstname} ${result.student.lastname}!`);
                // Redirect to student_navigator.html
                window.location.href = "student_navigator.html";
            } else {
                const errorText = await response.json();
                errorMessage.textContent = errorText.message || "Invalid credentials. Please try again.";
            }
        } catch (err) {
            errorMessage.textContent = "Error connecting to the server!";
            console.error(err);
        }
    });
});
