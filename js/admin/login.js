// ==========================================================================
// MFC KIM - Admin Login Controller
// Connects to Firebase Auth (email/password) or enables Demo Admin mode.
// ==========================================================================

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.querySelector("#login-form");
    const errorEl = document.querySelector("#login-error");
    const demoBtn = document.querySelector("#demo-login-btn");

    let auth = null;
    let isFirebaseConfigured = false;
    let signInWithEmailAndPassword = null;
    let onAuthStateChanged = null;

    // Wrap the Firebase imports so a failure here can't take down the whole page
    try {
        const config = await import("../firebase-config.js");
        auth = config.auth;
        isFirebaseConfigured = config.isFirebaseConfigured;

        const authModule = await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js");
        signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
        onAuthStateChanged = authModule.onAuthStateChanged;
    } catch (err) {
        console.error("Firebase failed to load — falling back to Demo Admin mode only:", err);
    }

    // Check if already logged in
    if (isFirebaseConfigured && auth && onAuthStateChanged) {
        onAuthStateChanged(auth, (user) => {
            if (user) window.location.href = "dashboard.html";
        });
    } else if (localStorage.getItem("mfckim_admin_demo") === "true") {
        window.location.href = "dashboard.html";
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.querySelector("#admin-email").value.trim();
            const password = document.querySelector("#admin-password").value;
            errorEl.style.display = "none";

            if (!isFirebaseConfigured || !auth || !signInWithEmailAndPassword) {
                errorEl.textContent = "⚠️ Firebase is not yet configured with your API keys. Please click 'Enter Demo Admin Mode' below to test the dashboard!";
                errorEl.style.display = "block";
                return;
            }
            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "dashboard.html";
            } catch (error) {
                console.error("Login Error:", error);
                errorEl.textContent = "❌ Invalid email or password. Please verify your credentials.";
                errorEl.style.display = "block";
            }
        });
    }

    if (demoBtn) {
        demoBtn.addEventListener("click", () => {
            localStorage.setItem("mfckim_admin_demo", "true");
            window.location.href = "dashboard.html";
        });
    }
});