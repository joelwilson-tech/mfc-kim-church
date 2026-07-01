// ==========================================================================
// MFC KIM - Firebase Configuration & SDK Initialization (ES Modules)
// ==========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// TODO: Replace the configuration below with your actual Firebase Project keys from console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyAbhgpnYAzbGLjyEN32RRzQLMhL88ewmbE",
  authDomain: "mfc-kim-website.firebaseapp.com",
  projectId: "mfc-kim-website",
  storageBucket: "mfc-kim-website.firebasestorage.app",
  messagingSenderId: "1008224719487",
  appId: "1:1008224719487:web:8a2847c8f997c79040e54a"
};

// Check if Firebase has been configured by the admin yet
export const isFirebaseConfigured = !firebaseConfig.apiKey.includes("YOUR_API_KEY_HERE");

export let app, db, auth;

if (isFirebaseConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        console.log("🔥 Firebase initialized successfully for MFC KIM!");
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
} else {
    console.warn("⚠️ Firebase is using placeholder credentials. Website is running in demo/fallback mode with realistic MFC KIM sample data.");
}
