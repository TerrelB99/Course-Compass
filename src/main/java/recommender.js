// recommender.js

document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.getElementById("authForm");
    const authTitle = document.getElementById("authTitle");
    const authButton = document.getElementById("authButton");
    const switchLink = document.getElementById("switchLink");
    const switchMessage = document.getElementById("switchMessage");
    const errorMessage = document.getElementById("errorMessage");

    let isSignIn = true;

    // Toggle between Sign In and Sign Up
    switchLink.addEventListener("click", (e) => {
        e.preventDefault();
        isSignIn = !isSignIn;

        if (isSignIn) {
            authTitle.textContent = "Sign In";
            authButton.textContent = "Sign In";
            switchMessage.textContent = "Don't have an account?";
            switchLink.textContent = "Sign Up";
        } else {
            authTitle.textContent = "Sign Up";
            authButton.textContent = "Sign Up";
            switchMessage.textContent = "Already have an account?";
            switchLink.textContent = "Sign In";
        }
    });

    // Handle form submission
    authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            errorMessage.textContent = "Both fields are required!";
            return;
        }

        if (isSignIn) {
            // Redirect to recommender dashboard on successful sign-in
            alert("Sign In Successful");
            errorMessage.textContent = ""; // Clear error message
            authForm.reset();

            // Redirect to recommender dashboard
            window.location.href = "recommender_dashboard.html";
        } else {
            // Mocked sign-up logic
            console.log(`Signing up as ${username}`);
            errorMessage.textContent = ""; // Clear error message
            alert("Sign Up Successful! You can now Sign In.");
            isSignIn = true;
            authTitle.textContent = "Sign In";
            authButton.textContent = "Sign In";
            switchMessage.textContent = "Don't have an account?";
            switchLink.textContent = "Sign Up";
            authForm.reset();
        }
    });
});
