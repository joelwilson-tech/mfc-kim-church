// ==========================================================================
// MFC KIM - About Page Controller
// Populates Church History/About text, Service Timings, and Location info.
// ==========================================================================
import { getSiteSettings, getCollectionData } from "../data-service.js";

document.addEventListener("DOMContentLoaded", async () => {
    const [settings, schedules] = await Promise.all([
        getSiteSettings(),
        getCollectionData("serviceSchedule")
    ]);

    // Populate About content
    const aboutBody = document.querySelector("#about-content-body");
    if (aboutBody && settings.aboutContent) {
        const paragraphs = settings.aboutContent.split(/\n\n+/);
        aboutBody.innerHTML = paragraphs.map(p => `<p style="margin-bottom: 20px;">${p}</p>`).join("");
    }

    // Populate Service Timings Grid
    const servicesGrid = document.querySelector("#about-services-grid");
    if (servicesGrid) {
        let list = [...schedules];
        if (list.length === 0) {
            list = [
                { icon: "🙏", title: "Sunday Morning Worship", time: "9:00 AM & 11:00 AM", description: "Traditional liturgy, choir worship, and expositional preaching." },
                { icon: "📖", title: "Wednesday Prayer & Bible Study", time: "7:00 PM", description: "Midweek spiritual renewal and interactive scriptural study." }
            ];
        } else {
            list.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
        }

        servicesGrid.innerHTML = list.map(srv => `
            <div class="service-card">
                <div class="service-icon">${srv.icon || "⛪"}</div>
                <h3 class="service-name">${srv.title}</h3>
                <div class="service-time">${srv.time}</div>
                <p class="service-desc">${srv.description}</p>
            </div>
        `).join("");
    }

    // Populate Address & Phone
    const addressEl = document.querySelector("#about-address");
    const phoneEl = document.querySelector("#about-phone");
    if (addressEl && settings.churchAddress) addressEl.textContent = settings.churchAddress;
    if (phoneEl && settings.contactPhone) phoneEl.textContent = settings.contactPhone;
});
