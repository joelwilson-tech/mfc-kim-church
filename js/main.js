// ==========================================================================
// MFC KIM - Main Shared UI JavaScript
// Handles Navigation, Mobile Menu, Sticky Header, Footer, and Lightbox.
// ==========================================================================
import { getSiteSettings, fetchVerseOfTheDay } from "./data-service.js";

document.addEventListener("DOMContentLoaded", async () => {
    initNavigation();
    initStickyHeader();
    await renderSharedFooter();
    initDailyVerseWidget();
    initLightbox();
});

/**
 * Initialize mobile hamburger menu toggle and active link marking.
 */
function initNavigation() {
    const toggleBtn = document.querySelector(".mobile-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            toggleBtn.innerHTML = navLinks.classList.contains("active") ? "✕" : "☰";
        });
    }

    // Mark current active link
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link").forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPath || (currentPath === "" && href === "index.html")) {
            link.classList.add("active");
        }
    });
}

/**
 * Add shadow and blur to header on scroll.
 */
function initStickyHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 30) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}

/**
 * Dynamically render the shared footer with contact details from Firestore/settings.
 */
async function renderSharedFooter() {
    const footerContainer = document.querySelector("#shared-footer");
    if (!footerContainer) return;

    const settings = await getSiteSettings();
    const currentYear = new Date().getFullYear();

    footerContainer.innerHTML = `
        <footer class="site-footer">
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-about">
                        <a href="index.html" class="brand-logo" style="margin-bottom: 16px;">
                            <div class="logo-cross">✝</div>
                            <div class="brand-text">
                                <span class="brand-title" style="color: var(--text-light);">MFC KIM</span>
                                <span class="brand-subtitle" style="color: var(--gold-light);">Church Family</span>
                            </div>
                        </a>
                        <p>${settings.aboutContent ? settings.aboutContent.substring(0, 160) + '...' : 'A welcoming community rooted in faith, prayer, and genuine fellowship.'}</p>
                        <div style="display: flex; gap: 12px; margin-top: 16px;">
                            <a href="#" style="color: var(--gold-light); font-size: 20px;">📘</a>
                            <a href="#" style="color: var(--gold-light); font-size: 20px;">📸</a>
                            <a href="#" style="color: var(--gold-light); font-size: 20px;">📺</a>
                        </div>
                    </div>
                    <div>
                        <h4 class="footer-title">Quick Links</h4>
                        <ul class="footer-links">
                            <li><a href="about.html">About Our Church</a></li>
                            <li><a href="pastor.html">Pastor's Message</a></li>
                            <li><a href="activities.html">Activities & Events</a></li>
                            <li><a href="songs.html">Song Lyrics</a></li>
                            <li><a href="admin/login.html" style="color: var(--maroon-light);">Admin Login</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="footer-title">Ministries & Media</h4>
                        <ul class="footer-links">
                            <li><a href="blog.html">Church Blogs</a></li>
                            <li><a href="gallery.html">Photo Gallery</a></li>
                            <li><a href="files.html">Downloadable Resources</a></li>
                            <li><a href="members.html">Leadership Directory</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="footer-title">Connect With Us</h4>
                        <ul class="footer-links" style="color: var(--text-light-muted); font-size: 14px; line-height: 1.8;">
                            <li>📍 ${settings.churchAddress || '1244 Heritage Sanctuary Road'}</li>
                            <li>📞 ${settings.contactPhone || '+1 (555) 384-9200'}</li>
                            <li>✉️ ${settings.contactEmail || 'info@mfckim.org'}</li>
                            <li style="margin-top: 10px;"><a href="contact.html" class="btn btn-secondary" style="padding: 6px 16px; font-size: 12px;">Send a Message</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; ${currentYear} MFC KIM Church. All rights reserved. Built with faith, love, and community.</p>
                </div>
            </div>
        </footer>
    `;
}

/**
 * Render Verse of the Day on the home page card.
 */
async function initDailyVerseWidget() {
    const verseTextEl = document.querySelector("#daily-verse-text");
    const verseRefEl = document.querySelector("#daily-verse-ref");
    if (!verseTextEl || !verseRefEl) return;

    try {
        const verse = await fetchVerseOfTheDay();
        verseTextEl.classList.remove("verse-loading");
        verseTextEl.textContent = verse.text;
        verseRefEl.textContent = `— ${verse.ref} —`;
    } catch (e) {
        verseTextEl.textContent = "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.";
        verseRefEl.textContent = "— Numbers 6:24-25 —";
    }
}

/**
 * Global Gallery Lightbox modal initialization.
 */
function initLightbox() {
    let modal = document.querySelector("#global-lightbox");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "global-lightbox";
        modal.className = "lightbox-modal";
        modal.innerHTML = `
            <button class="lightbox-close">&times;</button>
            <div class="lightbox-content">
                <img src="" alt="Enlarged gallery photo" class="lightbox-img">
                <p class="lightbox-text"></p>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector(".lightbox-close").addEventListener("click", () => {
            modal.classList.remove("active");
        });
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.remove("active");
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") modal.classList.remove("active");
        });
    }

    document.addEventListener("click", (e) => {
        const item = e.target.closest(".gallery-item");
        if (item) {
            const img = item.querySelector("img");
            const caption = item.querySelector(".gallery-caption");
            if (img) {
                modal.querySelector(".lightbox-img").src = img.src;
                modal.querySelector(".lightbox-text").textContent = caption ? caption.textContent : "";
                modal.classList.add("active");
            }
        }
    });
}
