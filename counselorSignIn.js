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
            const response = await fetch("http://localhost:3000/counselor/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const result = await response.json();
                const { firstName, lastName, messageSenderID, messageReceiverID } = result.counselor;

                // ✅ Set session storage for counselor
                sessionStorage.setItem("counselor", JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    role: "Counselor",
                    messageSenderID,
                    messageReceiverID
                }));

                alert(`Welcome, ${firstName} ${lastName}!`);
                window.location.href = "counselor_dashboard.html";
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
