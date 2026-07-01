// ==========================================================================
// MFC KIM - Activities & Events Controller
// Manages tab filtering between Upcoming Events and Past Gatherings.
// ==========================================================================
import { getCollectionData } from "../data-service.js";
import { IMAGE_PLACEHOLDER } from "../mock-data.js";

document.addEventListener("DOMContentLoaded", async () => {
    const activities = await getCollectionData("activities");
    const grid = document.querySelector("#activities-grid");
    const tabBtns = document.querySelectorAll(".tab-btn[data-filter]");

    if (!grid) return;

    // Default: show upcoming
    renderActivities(activities, "upcoming", grid);

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const filter = btn.getAttribute("data-filter");
            renderActivities(activities, filter, grid);
        });
    });
});

function renderActivities(activities, filter, grid) {
    const filtered = activities.filter(act => {
        if (filter === "upcoming") return act.isUpcoming === true || act.isUpcoming === "true";
        if (filter === "past") return act.isUpcoming === false || act.isUpcoming === "false";
        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--bg-parchment); border: 1.5px dashed var(--border-light); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin: 20px auto; max-width: 600px;">
                <div style="font-size: 48px; color: var(--gold-primary); margin-bottom: 16px;">📅</div>
                <h3 style="font-family: var(--font-serif); color: var(--wood-dark); font-size: 22px; margin-bottom: 8px;">No scheduled events yet</h3>
                <p style="color: var(--text-muted); font-size: 15px;">Check back soon! Fellowship gatherings, worship gala nights, and volunteer schedules are updated regularly.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(act => {
        const dateFormatted = act.eventDate ? new Date(act.eventDate).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
        }) : "Date TBA";

        return `
            <div class="content-card">
                <div class="card-img-wrapper">
                    <span class="card-badge" style="background: ${act.isUpcoming ? 'var(--maroon-primary)' : 'var(--wood-medium)'};">
                        ${act.isUpcoming ? '🔥 Upcoming' : '📜 Completed'}
                    </span>
                    <img src="${act.image || IMAGE_PLACEHOLDER}" alt="${act.title}" class="card-img" loading="lazy">
                </div>
                <div class="card-body">
                    <div class="card-meta" style="color: var(--gold-dark); font-weight: 600;">
                        <span>📅 ${dateFormatted}</span>
                    </div>
                    <h3 class="card-title">${act.title}</h3>
                    <p class="card-excerpt">${act.description || ''}</p>
                </div>
                <div class="card-footer" style="background: var(--bg-parchment); color: var(--wood-dark); font-size: 13px; font-weight: 600;">
                    <span>📍 ${act.location || 'MFC KIM Sanctuary'}</span>
                </div>
            </div>
        `;
    }).join("");
}
