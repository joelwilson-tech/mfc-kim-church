// ==========================================================================
// MFC KIM - Home Page Controller
// Populates Service Timings, Pastor Welcome, Featured Sermon, and Latest Blogs.
// ==========================================================================
import { getSiteSettings, getCollectionData } from "../data-service.js";

document.addEventListener("DOMContentLoaded", async () => {
    await loadHomeData();
});

async function loadHomeData() {
    const [settings, songs, blogs, schedules] = await Promise.all([
        getSiteSettings(),
        getCollectionData("songs"),
        getCollectionData("blogs"),
        getCollectionData("serviceSchedule")
    ]);

    // 1. Populate Service Timings Grid
    const servicesGrid = document.querySelector("#home-services-grid");
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

    // 2. Populate Pastor Greeting
    const pastorSummary = document.querySelector("#home-pastor-summary");
    const pastorPhoto = document.querySelector("#home-pastor-photo");
    if (pastorSummary && settings.pastorMessage) {
        pastorSummary.textContent = settings.pastorMessage;
     }
    if (pastorPhoto && settings.pastorPhoto) {
        pastorPhoto.src = settings.pastorPhoto;
    }

    // 3. Populate Featured Song Spotlight
    const featuredContainer = document.querySelector("#home-featured-song");
    if (featuredContainer && songs.length > 0) {
        // Grab the latest added song
        const featuredSong = songs[0];
        const dateStr = featuredSong.uploadedAt ? new Date(featuredSong.uploadedAt).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric"
        }) : "Recent Addition";

        featuredContainer.innerHTML = `
            <div class="content-card song-card" style="background: var(--bg-parchment); border: 2px solid var(--gold-primary); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg);">
                <div class="card-body" style="padding: 30px; text-align: center;">
                    <div style="font-size: 50px; color: var(--gold-primary); margin-bottom: 16px;">🎵</div>
                    <span class="card-badge" style="background: var(--maroon-primary); color: #fff; margin-bottom: 12px; display: inline-block;">
                        ${featuredSong.category || 'Worship'}
                    </span>
                    <h3 class="card-title" style="font-size: 26px; font-family: var(--font-serif); color: var(--wood-dark); margin-top: 8px; margin-bottom: 8px;">
                        ${featuredSong.title}
                    </h3>
                    <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px;">
                        📅 Released / Added: ${dateStr}
                    </p>
                    <a href="${featuredSong.fileUrl || '#'}" target="_blank" class="btn btn-maroon" style="padding: 10px 24px; font-size: 14px; display: inline-block;"
                       ${(!featuredSong.fileUrl || featuredSong.fileUrl === '#') ? 'onclick="alert(\'This is a demo song lyric sheet. Real PDF sheets can be uploaded via the Admin Dashboard.\'); return false;"' : ''}>
                        📖 View / Download Lyric Sheet (PDF)
                    </a>
                </div>
            </div>
        `;
    } else if (featuredContainer) {
        featuredContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: var(--radius-lg);">
                <p style="color: var(--text-light-muted); font-size: 16px; margin: 0;">No songs uploaded yet — check back soon!</p>
            </div>
        `;
    }

    // 4. Populate Latest Blog Cards (top 3)
    const blogsGrid = document.querySelector("#home-blogs-grid");
    if (blogsGrid && blogs.length > 0) {
        const topBlogs = blogs.slice(0, 3);
        blogsGrid.innerHTML = topBlogs.map(post => `
            <article class="content-card">
                <div class="card-img-wrapper">
                    <span class="card-badge">Ministry</span>
                    <img src="${post.coverImage || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=600&q=80'}" alt="${post.title}" class="card-img" loading="lazy">
                </div>
                <div class="card-body">
                    <div class="card-meta">
                        <span>📅 ${post.createdAt || 'Recent'}</span>
                        <span>✍️ ${post.author || 'MFC KIM Team'}</span>
                    </div>
                    <h3 class="card-title"><a href="blog-post.html?id=${post.id}">${post.title}</a></h3>
                    <p class="card-excerpt">${post.excerpt || (post.content ? post.content.substring(0, 110) + '...' : '')}</p>
                </div>
                <div class="card-footer">
                    <a href="blog-post.html?id=${post.id}" class="read-more">Read Full Article →</a>
                </div>
            </article>
        `).join("");
    }
}
