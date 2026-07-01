// ==========================================================================
// MFC KIM - Files & Resources Controller
// Manages document listing and category filtering.
// ==========================================================================
import { getCollectionData } from "../data-service.js";

document.addEventListener("DOMContentLoaded", async () => {
    const files = await getCollectionData("files");
    const grid = document.querySelector("#files-grid");
    const filterBtns = document.querySelectorAll("#file-filters .tab-btn");

    if (!grid) return;

    renderFiles(files, "All", grid);

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const cat = btn.getAttribute("data-category");
            renderFiles(files, cat, grid);
        });
    });
});

function renderFiles(files, category, grid) {
    const filtered = category === "All" 
        ? files 
        : files.filter(f => f.category && f.category.toLowerCase() === category.toLowerCase());

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--bg-parchment); border: 1.5px dashed var(--border-light); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin: 20px auto; max-width: 600px;">
                <div style="font-size: 48px; color: var(--gold-primary); margin-bottom: 16px;">📁</div>
                <h3 style="font-family: var(--font-serif); color: var(--wood-dark); font-size: 22px; margin-bottom: 8px;">No documents yet</h3>
                <p style="color: var(--text-muted); font-size: 15px;">Check back soon! Weekly bulletins, monthly prayer guides, and registration forms will be posted here.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(file => `
        <div class="file-card">
            <div class="file-icon">📄</div>
            <div class="file-info">
                <h4 class="file-title">${file.title}</h4>
                <div class="file-meta">${file.category || 'General'} • ${file.fileType || 'PDF'} • Added: ${file.uploadedAt || 'Recent'}</div>
            </div>
            <a href="${file.fileUrl || '#'}" target="_blank" download class="btn-download" ${file.fileUrl === '#' ? 'onclick="alert(\'This is a sample demo file. Upload real PDFs via the Admin Dashboard.\'); return false;"' : ''}>
                ⬇️ Download
            </a>
        </div>
    `).join("");
}
