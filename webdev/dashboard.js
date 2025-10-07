// File: /webdev/webdev/dashboard.js

// Function to toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    // Save the current mode to localStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// Function to load the preferred theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;

    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }
}

// Event listener for the dark mode toggle button
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
});