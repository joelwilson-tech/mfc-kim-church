// ==========================================================================
// MFC KIM - Contact Page Controller
// Populates contact info and handles inquiry submission to Firestore.
// ==========================================================================
import { getSiteSettings, submitContactMessage } from "../data-service.js";

document.addEventListener("DOMContentLoaded", async () => {
    const settings = await getSiteSettings();

    const addrEl = document.querySelector("#contact-address");
    const phoneEl = document.querySelector("#contact-phone");
    const emailEl = document.querySelector("#contact-email");

    if (addrEl && settings.churchAddress) addrEl.textContent = settings.churchAddress;
    if (phoneEl && settings.contactPhone) phoneEl.textContent = settings.contactPhone;
    if (emailEl && settings.contactEmail) emailEl.textContent = settings.contactEmail;

    const form = document.querySelector("#inquiry-form");
    const statusEl = document.querySelector("#form-status");
    const submitBtn = document.querySelector("#submit-btn");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const name = document.querySelector("#sender-name").value.trim();
            const email = document.querySelector("#sender-email").value.trim();
            const phone = document.querySelector("#sender-phone").value.trim();
            const subject = document.querySelector("#sender-subject").value.trim();
            const message = document.querySelector("#sender-message").value.trim();

            if (!name || !email || !subject || !message) {
                showStatus("Please fill in all required fields.", "error");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = "⏳ Saving message to office dashboard...";

            const res = await submitContactMessage({
                name, email, phone, subject, message
            });

            submitBtn.disabled = false;
            submitBtn.innerHTML = "✉️ Submit Message to Sanctuary Office";

            if (res.success) {
                showStatus(
                    res.demo 
                    ? "✨ Message saved successfully! (Demo Mode: View your inquiry instantly in the Admin Dashboard under 'Messages')."
                    : "🙏 Thank you! Your inquiry has been securely sent to our pastoral team in Firestore.",
                    "success"
                );
                form.reset();
            } else {
                showStatus("⚠️ Failed to send message: " + res.error, "error");
            }
        });
    }

    function showStatus(msg, type) {
        statusEl.className = "form-status " + type;
        statusEl.textContent = msg;
        setTimeout(() => {
            if (type === "success") statusEl.className = "form-status";
        }, 8000);
    }
});
