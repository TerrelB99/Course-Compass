// counselor.js

// Functionality for the Counselor role

document.addEventListener("DOMContentLoaded", () => {
    console.log("Counselor module loaded.");

    const form = document.getElementById("counselorForm");
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;

        if (name && email && message) {
            console.log("Counselor request submitted:", { name, email, message });
            alert("Your message has been sent successfully.");
            form.reset();
        } else {
            alert("Please fill out all fields.");
        }
    });
});
