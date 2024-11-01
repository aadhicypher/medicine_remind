// authentication.js

// Handle registration form submission
document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageElement = document.getElementById('registerMessage');

    messageElement.innerText = '';

    if (password !== confirmPassword) {
        messageElement.innerText = 'Passwords do not match!';
        return;
    }

    try {
        const response = await fetch('http://localhost:4000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        messageElement.innerText = data.message || data.error || 'Registration failed.';
    } catch (error) {
        console.error('Registration error:', error);
        messageElement.innerText = 'An error occurred. Please try again later.';
    }
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const messageElement = document.getElementById('loginMessage');

    try {
        const response = await fetch('http://localhost:4000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.token) {
            messageElement.style.color = 'green';
            messageElement.innerText = 'Login successful!';
            localStorage.setItem('authToken', data.token); // Store token
            toggleVisibilityAfterLogin();
        } else {
            messageElement.innerText = data.error || 'Login failed.';
        }
    } catch (error) {
        console.error('Login error:', error);
        messageElement.innerText = 'An error occurred. Please try again later.';
    }
});

// Toggle visibility of sections based on login status
function toggleVisibilityAfterLogin() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('medicineContainer').style.display = 'block';
}

// Check if user is logged in on page load
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        toggleVisibilityAfterLogin();
    }
});
