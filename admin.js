document.addEventListener("DOMContentLoaded", () => {
    const allUsersButton = document.getElementById("allUsersButton");
    const logoutButton = document.getElementById("logoutButton");

    if (allUsersButton) {
        allUsersButton.addEventListener("click", () => {
            window.location.href = "admin_dashboard.html"; // Redirect to All Users page
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            showLogoutPopup();
            setTimeout(() => {
                window.location.href = "welcome.html"; // Redirect after message disappears
            }, 2000);
        });
    }
});

function showLogoutPopup() {
    // Remove existing popups (prevents duplicates)
    const existingPopup = document.querySelector(".logout-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create the pop-up div
    const popup = document.createElement("div");
    popup.textContent = "Logging Out... See you soon!";
    popup.className = "logout-popup";
    document.body.appendChild(popup);

    // Force reflow to apply animation properly
    setTimeout(() => {
        popup.classList.add("visible");
    }, 10);

    // Start slide-out after 1.5s
    setTimeout(() => {
        popup.classList.add("slide-out");
        setTimeout(() => popup.remove(), 500);
    }, 1500);
}
