// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBKo4eVU8IB9Uo7kc9Eo12ZMZ_JDrt5Hkc",
    authDomain: "echostudy-e04db.firebaseapp.com",
    projectId: "echostudy-e04db",
    storageBucket: "echostudy-e04db.firebasestorage.app",
    messagingSenderId: "42094151583",
    appId: "1:42094151583:web:172cd320a3d83626301faa",
    measurementId: "G-VEPPHJE5KT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Handle auth state changes
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("User is logged in:", user.email);
        // Update UI elements with user info
        updateUserUI(user);
        // Redirect to dashboard if on login/signup page
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('signup.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        console.log("No user is logged in");
        // Redirect to login if trying to access protected pages
        if (window.location.pathname.includes('dashboard.html') || 
            window.location.pathname.includes('profile.html')) {
            window.location.href = 'login.html';
        }
    }
});

// Update UI with user info
function updateUserUI(user) {
    // Update dashboard header
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = user.displayName || user.email;
    }
}

// Email Sign Up
function signUpWithEmail(email, password, name) {
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Update profile with name
            return userCredential.user.updateProfile({
                displayName: name
            });
        })
        .then(() => {
            console.log("Signed up successfully");
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            console.error(error.message);
            showError(error.message);
        });
}

// Email Login
function loginWithEmail(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log("Logged in successfully");
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            console.error(error.message);
            showError(error.message);
        });
}

// Google Sign In
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            console.log("Google Sign-in success");
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            console.error("Google Sign-in error:", error);
            showError(error.message);
        });
}

// Sign Out
function signOut() {
    auth.signOut()
        .then(() => {
            console.log("Signed out successfully");
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error("Sign out error:", error);
        });
}

// Show error message
function showError(message) {
    const errorElement = document.querySelector('.auth-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
} 