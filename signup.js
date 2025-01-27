const signupForm = document.getElementById('signupForm');
const userType = document.getElementById('userType');
const companyField = document.getElementById('company');
const errorMessage = document.getElementById('errorMessage');

// Toggle company field visibility based on user type
userType.addEventListener('change', () => {
    if (userType.value === 'recruiter') {
        companyField.style.display = 'block';
        companyField.setAttribute('required', 'required');
    } else {
        companyField.style.display = 'none';
        companyField.removeAttribute('required');
    }
});

// Handle form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstname = document.getElementById('firstname').value.trim();
    const lastname = document.getElementById('lastname').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const company = userType.value === 'recruiter' ? companyField.value.trim() : null;

    if (!firstname || !lastname || !username || !password || (userType.value === 'recruiter' && !company)) {
        errorMessage.textContent = 'All fields are required!';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstname, lastname, username, password, company, userType: userType.value }),
        });

        if (response.ok) {
            alert('Signup successful!');
            window.location.href = userType.value === 'recruiter' ? 'recruiter_signin.html' : 'signin.html';
        } else {
            const errorText = await response.text();
            errorMessage.textContent = errorText;
        }
    } catch (err) {
        errorMessage.textContent = 'Error connecting to the server!';
        console.error(err);
    }
});
