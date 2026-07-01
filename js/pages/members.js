// ==========================================================================
// MFC KIM - Members & Leadership Controller
// Renders church leadership ordered by their schema 'order' field.
// ==========================================================================
import { getCollectionData } from "../data-service.js";
import { AVATAR_PLACEHOLDER } from "../mock-data.js";

document.addEventListener("DOMContentLoaded", async () => {
    const members = await getCollectionData("members");
    const grid = document.querySelector("#members-grid");

    if (!grid) return;

    if (members.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--bg-parchment); border: 1.5px dashed var(--border-light); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin: 20px auto; max-width: 600px;">
                <div style="font-size: 48px; color: var(--gold-primary); margin-bottom: 16px;">👥</div>
                <h3 style="font-family: var(--font-serif); color: var(--wood-dark); font-size: 22px; margin-bottom: 8px;">Leadership directory is empty</h3>
                <p style="color: var(--text-muted); font-size: 15px;">Check back soon! Profiles of our pastoral team, elders, and ministry leaders will be updated shortly.</p>
            </div>
        `;
        return;
    }

    // Sort by order field ascending
    members.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

    grid.innerHTML = members.map(mem => `
        <div class="member-card">
            <div class="member-photo-wrapper">
                <img src="${mem.photo || AVATAR_PLACEHOLDER}" alt="${mem.name}" class="member-photo" loading="lazy">
            </div>
            <h3 class="member-name">${mem.name}</h3>
            <span class="member-role">${mem.role || 'Servant Leader'}</span>
            <p class="member-bio">${mem.bio || ''}</p>
        </div>
    `).join("");
});
