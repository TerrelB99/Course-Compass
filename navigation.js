// navigation.js

// Function to handle navigation based on the role selected
function navigateTo(page) {
    window.location.href = page;
}

// Adding event listeners to specific elements
window.addEventListener('DOMContentLoaded', () => {
    const recruiterBox = document.getElementById('recruiterBox');
    const studentBox = document.getElementById('studentBox');
    const reccomenderBox = document.getElementById('reccomenderBox');

    if (studentBox) {
        studentBox.addEventListener('click', () => {
            navigateTo('signin.html');
        });
    }

    if (reccomenderBox) {
        reccomenderBox.addEventListener('click', () => {
            navigateTo('recommender_sign.html');
        });
    }

    if (recruiterBox) {
        recruiterBox.addEventListener('click', () => {
            navigateTo('recruiter_signin.html');
        });
    }
});