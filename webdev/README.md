# EchoStudy Project

## Overview
EchoStudy is a web application designed to help users manage their study tasks and track their progress. The application features a dashboard for task management, a user profile page, and a homepage.

## File Structure
- **dashboard.html**: Contains the structure of the dashboard page, including the header, main content, and modals.
- **index.html**: Serves as the homepage of the website.
- **profile.html**: Represents the user profile page.
- **styles.css**: Contains the styles for the website.
- **dashboard.js**: Contains JavaScript functionality for the dashboard.
- **firebase-auth.js**: Handles Firebase authentication.
- **darkmode.js**: Manages the dark mode functionality, including event listeners and toggling classes.
- **README.md**: Documentation for the project.

## Dark Mode Feature
The application includes a dark mode feature that allows users to switch between light and dark themes for a better viewing experience in low-light conditions. 

### How to Use Dark Mode
1. **Toggle Button**: A toggle button is available in the header of each page (dashboard, index, and profile) to switch between light and dark modes.
2. **Automatic Preference**: The application remembers the user's preference for dark mode using local storage, so the selected mode persists across sessions.

### Implementation
- The dark mode toggle button is implemented in the header of each HTML file.
- Styles for dark mode are defined in `styles.css`.
- The functionality for toggling dark mode is handled in `darkmode.js`, which is included in each HTML file.

## Getting Started
To run the application, open `index.html` in a web browser. Ensure that all JavaScript and CSS files are correctly linked.

## Future Enhancements
- Additional themes can be added for more customization options.
- User settings can be expanded to include more personalization features.