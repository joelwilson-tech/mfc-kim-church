// ==========================================================================
// MFC KIM - Songs & Sacred Hymns Page Controller
// Fetches song sheets, handles categories/filters, search, and pagination.
// ==========================================================================
import { getCollectionData } from "../data-service.js";

document.addEventListener("DOMContentLoaded", async () => {
    const songs = await getCollectionData("songs");
    const grid = document.querySelector("#songs-grid");
    const searchInput = document.querySelector("#song-search");
    const filterBtns = document.querySelectorAll("#song-filters .tab-btn");
    
    // Pagination Controls
    const prevBtn = document.querySelector("#btn-prev-page");
    const nextBtn = document.querySelector("#btn-next-page");
    const pageIndicator = document.querySelector("#page-indicator");
    const paginationContainer = document.querySelector("#songs-pagination");

    if (!grid) return;

    const SONGS_PER_PAGE = 6;
    let currentPage = 1;
    let activeCategory = "All";
    let searchQuery = "";

    function renderFilteredSongs() {
        let filtered = songs;

        // Apply Category Filter
        if (activeCategory !== "All") {
            filtered = filtered.filter(s => s.category && s.category.toLowerCase() === activeCategory.toLowerCase());
        }

        // Apply Search Query Filter
        if (searchQuery) {
            filtered = filtered.filter(s => 
                (s.title && s.title.toLowerCase().includes(searchQuery)) ||
                (s.category && s.category.toLowerCase().includes(searchQuery))
            );
        }

        const totalSongs = filtered.length;
        const totalPages = Math.ceil(totalSongs / SONGS_PER_PAGE);

        // Reset to page 1 if current page becomes invalid or search triggers
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

        // Check if empty
        if (totalSongs === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--bg-parchment); border: 1.5px dashed var(--border-light); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
                    <div style="font-size: 48px; color: var(--gold-primary); margin-bottom: 16px;">🎵</div>
                    <h3 style="font-family: var(--font-serif); color: var(--wood-dark); font-size: 22px; margin-bottom: 8px;">No songs uploaded yet</h3>
                    <p style="color: var(--text-muted); font-size: 15px;">Check back soon! Sacred lyrics and hymn sheets will appear here shortly.</p>
                </div>
            `;
            if (paginationContainer) paginationContainer.style.display = "none";
            return;
        }

        // Slice songs for the current page
        const startIndex = (currentPage - 1) * SONGS_PER_PAGE;
        const paginatedSongs = filtered.slice(startIndex, startIndex + SONGS_PER_PAGE);

        // Render song cards
        grid.innerHTML = paginatedSongs.map(song => {
            const dateStr = song.uploadedAt ? new Date(song.uploadedAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
            }) : "Recent";

            return `
                <div class="content-card song-card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid var(--gold-primary);">
                    <div class="card-body" style="padding: 24px;">
                        <span class="card-badge" style="background: var(--maroon-primary); color: #fff; margin-bottom: 12px; display: inline-block;">
                            ${song.category || 'Hymn'}
                        </span>
                        <h3 class="card-title" style="font-size: 20px; font-family: var(--font-serif); color: var(--wood-dark); margin-top: 8px; margin-bottom: 8px;">
                            ${song.title}
                        </h3>
                        <p style="font-size: 13px; color: var(--text-muted);">
                            📅 Added: ${dateStr}
                        </p>
                    </div>
                    <div class="card-footer" style="background: var(--bg-parchment); padding: 16px 24px; border-top: 1px solid var(--border-light); display: flex; justify-content: center;">
                        <a href="${song.fileUrl || '#'}" target="_blank" class="btn btn-secondary btn-sm" style="width: 100%; text-align: center; border-color: var(--wood-dark); color: var(--wood-dark);"
                           ${(!song.fileUrl || song.fileUrl === '#') ? 'onclick="alert(\'This is a demo song lyric sheet. Real PDF sheets can be uploaded via the Admin Dashboard.\'); return false;"' : ''}>
                            📖 View / Download PDF
                        </a>
                    </div>
                </div>
            `;
        }).join("");

        // Configure pagination elements visibility & states
        if (paginationContainer) {
            paginationContainer.style.display = "flex";
            if (pageIndicator) pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
            
            if (prevBtn) {
                prevBtn.disabled = (currentPage === 1);
                prevBtn.style.opacity = (currentPage === 1) ? "0.5" : "1";
                prevBtn.style.cursor = (currentPage === 1) ? "not-allowed" : "pointer";
            }
            if (nextBtn) {
                nextBtn.disabled = (currentPage === totalPages);
                nextBtn.style.opacity = (currentPage === totalPages) ? "0.5" : "1";
                nextBtn.style.cursor = (currentPage === totalPages) ? "not-allowed" : "pointer";
            }
        }
    }

    // Bind Pagination Clicks
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderFilteredSongs();
                window.scrollTo({ top: 300, behavior: "smooth" });
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            const filteredCount = searchQuery 
                ? songs.filter(s => ((s.title && s.title.toLowerCase().includes(searchQuery)) || (s.category && s.category.toLowerCase().includes(searchQuery)))).length
                : songs.length;
            const maxPages = Math.ceil(filteredCount / SONGS_PER_PAGE);

            if (currentPage < maxPages) {
                currentPage++;
                renderFilteredSongs();
                window.scrollTo({ top: 300, behavior: "smooth" });
            }
        });
    }

    // Initial render
    renderFilteredSongs();

    // Setup Category click listeners
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeCategory = btn.getAttribute("data-category");
            currentPage = 1; // Reset to page 1 on filter
            renderFilteredSongs();
        });
    });

    // Setup Search listener
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            currentPage = 1; // Reset to page 1 on search
            renderFilteredSongs();
        });
    }
});
