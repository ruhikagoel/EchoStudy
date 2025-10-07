// darkmode.js
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '<i class="fas fa-moon"></i> Toggle Dark Mode';
    toggleButton.classList.add('btn', 'btn-darkmode');
    document.body.appendChild(toggleButton);

    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    });

    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
    }
});