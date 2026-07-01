// ==========================================================================
// MFC KIM - Gallery Controller
// Manages photo grid filtering and lazy loading.
// ==========================================================================
import { getCollectionData } from "../data-service.js";
import { IMAGE_PLACEHOLDER } from "../mock-data.js";

document.addEventListener("DOMContentLoaded", async () => {
    const photos = await getCollectionData("gallery");
    const grid = document.querySelector("#gallery-grid");
    const filterBtns = document.querySelectorAll("#gallery-filters .tab-btn");

    if (!grid) return;

    renderGallery(photos, "All", grid);

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const cat = btn.getAttribute("data-category");
            renderGallery(photos, cat, grid);
        });
    });
});

function renderGallery(photos, category, grid) {
    const filtered = category === "All" 
        ? photos 
        : photos.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--bg-parchment); border: 1.5px dashed var(--border-light); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin: 20px auto; max-width: 600px;">
                <div style="font-size: 48px; color: var(--gold-primary); margin-bottom: 16px;">📸</div>
                <h3 style="font-family: var(--font-serif); color: var(--wood-dark); font-size: 22px; margin-bottom: 8px;">No photos yet</h3>
                <p style="color: var(--text-muted); font-size: 15px;">Check back soon! Photographic snapshots of Sunday services and sanctuary life will appear here.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(item => `
        <div class="gallery-item">
            <img src="${item.imageUrl || IMAGE_PLACEHOLDER}" alt="${item.caption || 'MFC KIM Photo'}" class="gallery-img" loading="lazy">
            <div class="gallery-overlay">
                <span class="gallery-category">${item.category || 'General'}</span>
                <h4 class="gallery-caption">${item.caption || 'Sanctuary Fellowship'}</h4>
            </div>
        </div>
    `).join("");
}
