document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("signupForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const studentData = {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            email: document.getElementById("email").value.trim(),
            username: document.getElementById("username").value.trim(),
            password: document.getElementById("password").value.trim(),
            university: document.getElementById("university").value.trim()
        };

        const response = await fetch("/student/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();
        alert(result.message);
        if (response.ok) window.location.href = "signin.html";
    });
});
