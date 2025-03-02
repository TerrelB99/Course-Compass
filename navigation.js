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
    const adminBox = document.getElementById("adminBox");
    const AdminStudentBox = document.getElementById("AdminStudentBox");
    const AdminRecruiterBox = document.getElementById("AdminRecruiterBox");

    if(AdminRecruiterBox){
        AdminRecruiterBox.addEventListener("click", () =>{
            navigateTo("AdminR_dashboard.html");
        });
    }

    if (AdminStudentBox) {
        AdminStudentBox.addEventListener("click", () => {
            navigateTo("Astudent_dashboard.html");
        });
    }

    if (adminBox) {
        adminBox.addEventListener("click", () => {
            navigateTo("admin.html");
        });
    }


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