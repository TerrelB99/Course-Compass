document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("recruiterSignupForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const recruiterData = {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            email: document.getElementById("email").value.trim(),
            username: document.getElementById("username").value.trim(),
            password: document.getElementById("password").value.trim(),
            company: document.getElementById("company").value.trim()
        };

        const response = await fetch("/recruiter/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(recruiterData)
        });

        const result = await response.json();
        alert(result.message);
        if (response.ok) window.location.href = "recruiter_signin.html";
    });
});
