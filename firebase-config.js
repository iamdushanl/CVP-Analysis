// ========================================
// Firebase Configuration
// New Project: cvp-analysis-system-9fe43
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyBYN19xPqIxpQOza4kyedCOxTXsfkoYiic",
    authDomain: "cvp-analysis-system-9fe43.firebaseapp.com",
    projectId: "cvp-analysis-system-9fe43",
    storageBucket: "cvp-analysis-system-9fe43.firebasestorage.app",
    messagingSenderId: "513739248644",
    appId: "1:513739248644:web:b12c41f65810f8ba025151",
    measurementId: "G-74XKHDZBHM"
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseConfig;
} else {
    window.firebaseConfig = firebaseConfig;
}
