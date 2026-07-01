// ==========================================================================
// MFC KIM - Blog & Article View Controller
// Handles blog listing grid and single post reader page.
// ==========================================================================
import { getCollectionData } from "../data-service.js";
import { IMAGE_PLACEHOLDER } from "../mock-data.js";

document.addEventListener("DOMContentLoaded", async () => {
    const isPostPage = window.location.pathname.includes("blog-post.html");
    const blogs = await getCollectionData("blogs");

    if (isPostPage) {
        renderSinglePost(blogs);
    } else {
        renderBlogList(blogs);
    }
});

function renderBlogList(blogs) {
    const grid = document.querySelector("#blog-list-grid");
    if (!grid) return;

    if (blogs.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--bg-parchment); border: 1.5px dashed var(--border-light); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
                <div style="font-size: 48px; color: var(--gold-primary); margin-bottom: 16px;">✍️</div>
                <h3 style="font-family: var(--font-serif); color: var(--wood-dark); font-size: 22px; margin-bottom: 8px;">No posts yet</h3>
                <p style="color: var(--text-muted); font-size: 15px;">Check back soon! Inspiring devotionals and ministry articles are on their way.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = blogs.map(post => `
        <article class="content-card">
            <div class="card-img-wrapper">
                <span class="card-badge">Devotional</span>
                <img src="${post.coverImage || IMAGE_PLACEHOLDER}" alt="${post.title}" class="card-img" loading="lazy">
            </div>
            <div class="card-body">
                <div class="card-meta">
                    <span>📅 ${post.createdAt || 'Recent'}</span>
                    <span>✍️ ${post.author || 'MFC KIM Team'}</span>
                </div>
                <h3 class="card-title"><a href="blog-post.html?id=${post.id}">${post.title}</a></h3>
                <p class="card-excerpt">${post.excerpt || (post.content ? post.content.substring(0, 120) + '...' : '')}</p>
            </div>
            <div class="card-footer">
                <a href="blog-post.html?id=${post.id}" class="read-more">Read Article →</a>
            </div>
        </article>
    `).join("");
}

function renderSinglePost(blogs) {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    const postSlug = urlParams.get("slug");

    let post = null;
    if (postId) {
        post = blogs.find(b => b.id === postId);
    } else if (postSlug) {
        post = blogs.find(b => b.slug === postSlug);
    }

    // Default to first blog if not found or no ID provided
    if (!post && blogs.length > 0) {
        post = blogs[0];
    }

    if (!post) {
        document.querySelector("#post-title").textContent = "Article Not Found";
        document.querySelector("#post-content-body").innerHTML = `<p>We could not locate the requested devotional article. Please return to the blog directory.</p>`;
        return;
    }

    document.title = `${post.title} - MFC KIM Blog`;
    document.querySelector("#post-title").textContent = post.title;
    document.querySelector("#post-date").textContent = `📅 ${post.createdAt || 'Recent'}`;
    document.querySelector("#post-author").textContent = `✍️ By ${post.author || 'MFC KIM Team'}`;
    
    const imgWrapper = document.querySelector("#post-image-wrapper");
    const imgEl = document.querySelector("#post-image");
    if (post.coverImage) {
        imgEl.src = post.coverImage;
    } else if (imgWrapper) {
        imgWrapper.style.display = "none";
    }

    const contentBody = document.querySelector("#post-content-body");
    if (contentBody && post.content) {
        const paragraphs = post.content.split(/\n\n+/);
        contentBody.innerHTML = paragraphs.map(p => `<p style="margin-bottom: 24px;">${p}</p>`).join("");
    }
}
