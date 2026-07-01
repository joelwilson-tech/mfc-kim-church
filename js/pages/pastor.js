// ==========================================================================
// MFC KIM - Pastor's Message Controller
// Dynamically renders the Pastor's written message and photo from settings.
// ==========================================================================
import { getSiteSettings } from "../data-service.js";

document.addEventListener("DOMContentLoaded", async () => {
    const settings = await getSiteSettings();

    const photoEl = document.querySelector("#pastor-photo");
    const msgContainer = document.querySelector("#pastor-message-container");

    if (photoEl && settings.pastorPhoto) {
        photoEl.src = settings.pastorPhoto;
    }

    if (msgContainer && settings.pastorMessage) {
        // Format message with paragraphs
        const paragraphs = settings.pastorMessage.split(/\n\n+/);
        msgContainer.innerHTML = paragraphs.map(p => `<p style="margin-bottom: 20px;">${p}</p>`).join("");
    }
});
