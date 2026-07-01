// ==========================================================================
// MFC KIM - Admin Dashboard Controller
// Handles CRUD for all 8 collections, Auth state, and Demo Seeding.
// ==========================================================================
import { auth, db, isFirebaseConfigured } from "../firebase-config.js";
import { getSiteSettings, getCollectionData } from "../data-service.js";
import { MOCK_DATA, IMAGE_PLACEHOLDER, AVATAR_PLACEHOLDER } from "../mock-data.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { uploadToGitHub } from "../github-storage.js";
import { isGitHubConfigured } from "../github-config.js";

let currentCollection = "";
let currentEditId = null;
let cachedData = {};

document.addEventListener("DOMContentLoaded", async () => {
    checkAdminAuth();
    initSidebar();
    initModalHandlers();
    initSeedTool();
    initClearTool();
    await loadAllDashboardData();
    initSettingsForm();
});

/**
 * Verify Admin authentication or Demo Mode.
 */
function checkAdminAuth() {
    const isDemo = localStorage.getItem("mfckim_admin_demo") === "true";
    
    if (isFirebaseConfigured && auth) {
        onAuthStateChanged(auth, (user) => {
            if (!user && !isDemo) {
                window.location.href = "login.html";
            } else if (user) {
                showToast(`Welcome back, ${user.email}`, "success");
            } else if (isDemo) {
                showToast("⚡ Running in Demo Admin Mode", "success");
            }
        });
    } else if (!isDemo) {
        window.location.href = "login.html";
    } else {
        showToast("⚡ Running in Demo Admin Mode", "success");
    }

    const logoutBtn = document.querySelector("#logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            localStorage.removeItem("mfckim_admin_demo");
            if (isFirebaseConfigured && auth) {
                try { await signOut(auth); } catch(e){}
            }
            window.location.href = "login.html";
        });
    }
}

/**
 * Sidebar navigation tab switching.
 */
function initSidebar() {
    const links = document.querySelectorAll(".sidebar-link[data-target]");
    const sections = document.querySelectorAll(".admin-section");
    const titleEl = document.querySelector("#panel-title-display");
    const descEl = document.querySelector("#panel-desc-display");

    const titles = {
        "panel-settings": { t: "⚙️ Site Settings & Pastor's Letter", d: "Manage church address, weekly service times, and pastoral greeting." },
        "panel-schedule": { t: "⛪ Weekly Worship Gatherings", d: "Manage services, prayer times, and order cards with ▲ / ▼ arrows." },
        "panel-messages": { t: "💬 Inquiries & Messages", d: "Review prayer requests, visit inquiries, and contact form submissions." },
        "panel-blogs": { t: "✍️ Blogs Manager", d: "Write, edit, and publish church ministry articles and devotionals." },
        "panel-activities": { t: "📅 Activities & Events", d: "Schedule upcoming fellowship gatherings and maintain past event archives." },
        "panel-gallery": { t: "📸 Photo Gallery", d: "Upload and categorize sanctuary photographs for the public gallery." },
        "panel-songs": { t: "🎵 Song Lyrics Manager", d: "Upload sacred hymns, choir specials, or contemporary worship sheet music in PDF format." },
        "panel-files": { t: "📁 Files & Resources Manager", d: "Upload downloadable PDF bulletins, prayer guides, and forms." },
        "panel-members": { t: "👥 Leadership Directory", d: "Maintain pastoral profiles and ministry leadership directory ordering." },
        "panel-seed": { t: "⚡ Database Tools & Reset", d: "Automatically seed MFC KIM demo data or perform a clean reset of Firestore collections." }
    };

    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));

            link.classList.add("active");
            const targetId = link.getAttribute("data-target");
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add("active");

            if (titles[targetId]) {
                titleEl.textContent = titles[targetId].t;
                descEl.textContent = titles[targetId].d;
            }
        });
    });
}

/**
 * Fetch and display data for all panels.
 */
async function loadAllDashboardData() {
    // Load Settings
    const settings = await getSiteSettings();
    cachedData.settings = settings;
    populateSettingsForm(settings);

    // Load Collections
    const [messages, blogs, activities, gallery, songs, files, members, serviceSchedule] = await Promise.all([
        getCollectionData("messages"),
        getCollectionData("blogs"),
        getCollectionData("activities"),
        getCollectionData("gallery"),
        getCollectionData("songs"),
        getCollectionData("files"),
        getCollectionData("members"),
        getCollectionData("serviceSchedule")
    ]);

    cachedData.messages = messages;
    cachedData.blogs = blogs;
    cachedData.activities = activities;
    cachedData.gallery = gallery;
    cachedData.songs = songs;
    cachedData.files = files;
    cachedData.members = members;
    cachedData.serviceSchedule = serviceSchedule;

    renderMessagesTable(messages);
    renderBlogsTable(blogs);
    renderActivitiesTable(activities);
    renderGalleryTable(gallery);
    renderSongsTable(songs);
    renderFilesTable(files);
    renderMembersTable(members);
    renderScheduleTable(serviceSchedule);
}

/**
 * Populate Site Settings form fields.
 */
function populateSettingsForm(settings) {
    if (!settings) return;
    document.querySelector("#set-address").value = settings.churchAddress || "";
    document.querySelector("#set-phone").value = settings.contactPhone || "";
    document.querySelector("#set-email").value = settings.contactEmail || "";
    document.querySelector("#set-pastor-photo").value = settings.pastorPhoto || "";
    document.querySelector("#set-about").value = settings.aboutContent || "";
    document.querySelector("#set-pastor-msg").value = settings.pastorMessage || "";
}

function initSettingsForm() {
    const form = document.querySelector("#form-site-settings");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector("button[type='submit']");
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = "⏳ Uploading to GitHub & Saving...";

        try {
            const photoInput = document.querySelector("#set-pastor-photo-file");
            let photoUrl = document.querySelector("#set-pastor-photo").value.trim();

            if (photoInput && photoInput.files.length > 0) {
                const file = photoInput.files[0];
                if (isGitHubConfigured) {
                    photoUrl = await uploadToGitHub(file, "uploads/settings/");
                } else {
                    photoUrl = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
                }
            }

            const updated = {
                ...cachedData.settings,
                churchAddress: document.querySelector("#set-address").value.trim(),
                contactPhone: document.querySelector("#set-phone").value.trim(),
                contactEmail: document.querySelector("#set-email").value.trim(),
                pastorPhoto: photoUrl,
                aboutContent: document.querySelector("#set-about").value.trim(),
                pastorMessage: document.querySelector("#set-pastor-msg").value.trim()
            };

            if (isFirebaseConfigured && db) {
                await setDoc(doc(db, "settings", "site"), updated, { merge: true });
                showToast("✨ Site settings saved to Firestore!", "success");
            } else {
                MOCK_DATA.settings.site = updated;
                localStorage.setItem("mfckim_mock_settings", JSON.stringify(updated));
                showToast("✨ Site settings updated locally (Demo Mode)!", "success");
            }
            await loadAllDashboardData();
        } catch (error) {
            console.error("Save settings error:", error);
            showToast("❌ Failed to save settings: " + error.message, "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

/**
 * Table Renderers
 */
function renderMessagesTable(list) {
    const tbody = document.querySelector("#table-messages-body");
    const badge = document.querySelector("#msg-badge-count");
    if (!tbody) return;

    if (badge) badge.textContent = list.length;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--admin-muted);">No inquiries received yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => {
        const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent";
        return `
            <tr>
                <td><span class="badge ${item.read ? 'badge-info' : 'badge-warning'}">${item.read ? 'Read' : 'New'}</span></td>
                <td style="font-weight: 600;">${item.name || 'Anonymous'}</td>
                <td>${item.subject || 'General'}</td>
                <td style="font-size: 13px;">✉️ ${item.email || '-'}<br>📞 ${item.phone || '-'}</td>
                <td>${dateStr}</td>
                <td class="td-actions">
                    <button class="btn-admin btn-admin-primary btn-sm btn-view-msg" data-id="${item.id}">👁️ Read</button>
                    <button class="btn-admin btn-admin-danger btn-sm btn-del-msg" data-id="${item.id}">🗑️</button>
                </td>
            </tr>
        `;
    }).join("");

    // Bind actions
    tbody.querySelectorAll(".btn-view-msg").forEach(btn => {
        btn.addEventListener("click", () => openMessageModal(btn.getAttribute("data-id")));
    });
    tbody.querySelectorAll(".btn-del-msg").forEach(btn => {
        btn.addEventListener("click", () => deleteRecord("messages", btn.getAttribute("data-id")));
    });
}

function openMessageModal(id) {
    const msg = cachedData.messages.find(m => m.id === id);
    if (!msg) return;

    const modal = document.querySelector("#msg-modal");
    const content = document.querySelector("#msg-modal-content");
    
    content.innerHTML = `
        <div style="background: #F8F9FA; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>From:</strong> ${msg.name} (&lt;${msg.email}&gt;)</p>
            <p><strong>Phone:</strong> ${msg.phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${msg.subject}</p>
            <p><strong>Date:</strong> ${msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Recent'}</p>
        </div>
        <div style="padding: 16px; background: #fff; border: 1px solid var(--admin-border); border-radius: 8px;">
            <p style="white-space: pre-wrap;">${msg.message}</p>
        </div>
    `;

    modal.classList.add("active");
}

function renderBlogsTable(list) {
    const tbody = document.querySelector("#table-blogs-body");
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--admin-muted);">No blog articles found.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => `
        <tr>
            <td><img src="${item.coverImage || IMAGE_PLACEHOLDER}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px;"></td>
            <td style="font-weight: 600;">${item.title}</td>
            <td>${item.author || 'MFC KIM Team'}</td>
            <td>${item.createdAt || 'Recent'}</td>
            <td><span class="badge ${item.published ? 'badge-success' : 'badge-warning'}">${item.published ? 'Published' : 'Draft'}</span></td>
            <td class="td-actions">
                <button class="btn-admin btn-admin-primary btn-sm btn-edit" data-col="blogs" data-id="${item.id}">✏️ Edit</button>
                <button class="btn-admin btn-admin-danger btn-sm btn-del" data-col="blogs" data-id="${item.id}">🗑️</button>
            </td>
        </tr>
    `).join("");

    bindTableActions(tbody);
}

function renderActivitiesTable(list) {
    const tbody = document.querySelector("#table-activities-body");
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-muted);">No fellowship activities scheduled.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => {
        const dateStr = item.eventDate ? new Date(item.eventDate).toLocaleString() : 'TBA';
        return `
            <tr>
                <td style="font-weight: 600;">${item.title}</td>
                <td>${dateStr}</td>
                <td>${item.location || 'Sanctuary'}</td>
                <td><span class="badge ${item.isUpcoming ? 'badge-success' : 'badge-info'}">${item.isUpcoming ? 'Upcoming' : 'Past'}</span></td>
                <td class="td-actions">
                    <button class="btn-admin btn-admin-primary btn-sm btn-edit" data-col="activities" data-id="${item.id}">✏️ Edit</button>
                    <button class="btn-admin btn-admin-danger btn-sm btn-del" data-col="activities" data-id="${item.id}">🗑️</button>
                </td>
            </tr>
        `;
    }).join("");

    bindTableActions(tbody);
}

function renderGalleryTable(list) {
    const tbody = document.querySelector("#table-gallery-body");
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-muted);">No gallery photographs uploaded.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => `
        <tr>
            <td><img src="${item.imageUrl || IMAGE_PLACEHOLDER}" style="width: 60px; height: 45px; object-fit: cover; border-radius: 4px;"></td>
            <td style="font-weight: 600;">${item.caption || 'Photo'}</td>
            <td><span class="badge badge-info">${item.category || 'General'}</span></td>
            <td>${item.uploadedAt || 'Recent'}</td>
            <td class="td-actions">
                <button class="btn-admin btn-admin-primary btn-sm btn-edit" data-col="gallery" data-id="${item.id}">✏️ Edit</button>
                <button class="btn-admin btn-admin-danger btn-sm btn-del" data-col="gallery" data-id="${item.id}">🗑️</button>
            </td>
        </tr>
    `).join("");

    bindTableActions(tbody);
}

function renderSongsTable(list) {
    const tbody = document.querySelector("#table-songs-body");
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-muted);">No songs uploaded yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => {
        const dateStr = item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : "Recent";
        return `
            <tr>
                <td style="font-weight: 600;">${item.title}</td>
                <td><span class="badge badge-info">${item.category || 'Hymn'}</span></td>
                <td><a href="${item.fileUrl || '#'}" target="_blank" style="font-size: 13px; font-weight: 600; color: var(--admin-gold);">📄 View PDF</a></td>
                <td>${dateStr}</td>
                <td class="td-actions">
                    <button class="btn-admin btn-admin-primary btn-sm btn-edit" data-col="songs" data-id="${item.id}">✏️ Edit</button>
                    <button class="btn-admin btn-admin-danger btn-sm btn-del" data-col="songs" data-id="${item.id}">🗑️</button>
                </td>
            </tr>
        `;
    }).join("");

    bindTableActions(tbody);
}

function renderFilesTable(list) {
    const tbody = document.querySelector("#table-files-body");
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-muted);">No file resources available.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => `
        <tr>
            <td style="font-weight: 600;">${item.title}</td>
            <td><span class="badge badge-info">${item.category || 'General'}</span></td>
            <td>${item.fileType || 'PDF'}</td>
            <td>${item.uploadedAt || 'Recent'}</td>
            <td class="td-actions">
                <button class="btn-admin btn-admin-primary btn-sm btn-edit" data-col="files" data-id="${item.id}">✏️ Edit</button>
                <button class="btn-admin btn-admin-danger btn-sm btn-del" data-col="files" data-id="${item.id}">🗑️</button>
            </td>
        </tr>
    `).join("");

    bindTableActions(tbody);
}

function renderMembersTable(list) {
    const tbody = document.querySelector("#table-members-body");
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-muted);">No leadership members added.</td></tr>`;
        return;
    }

    // Sort by order ascending
    const sorted = [...list].sort((a,b) => (Number(a.order)||99) - (Number(b.order)||99));

    tbody.innerHTML = sorted.map(item => `
        <tr>
            <td style="font-weight: 700; color: var(--admin-gold);">${item.order || 99}</td>
            <td><img src="${item.photo || AVATAR_PLACEHOLDER}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 50%;"></td>
            <td style="font-weight: 600;">${item.name}</td>
            <td style="color: var(--admin-primary); font-weight: 600;">${item.role}</td>
            <td class="td-actions">
                <button class="btn-admin btn-admin-primary btn-sm btn-edit" data-col="members" data-id="${item.id}">✏️ Edit</button>
                <button class="btn-admin btn-admin-danger btn-sm btn-del" data-col="members" data-id="${item.id}">🗑️</button>
            </td>
        </tr>
    `).join("");

    bindTableActions(tbody);
}

function renderScheduleTable(list) {
    const tbody = document.querySelector("#table-schedule-body");
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-muted);">No worship gatherings added. Default fallback cards will show on public pages.</td></tr>`;
        return;
    }

    const sorted = [...list].sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

    tbody.innerHTML = sorted.map((item, idx) => `
        <tr>
            <td style="text-align: center; font-size: 20px;">${item.icon || "⛪"}</td>
            <td style="font-weight: 600;">${item.title}</td>
            <td>${item.time}</td>
            <td style="text-align: center;">
                <button class="btn-admin btn-sm btn-order" data-direction="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}>▲</button>
                <button class="btn-admin btn-sm btn-order" data-direction="down" data-idx="${idx}" ${idx === sorted.length - 1 ? 'disabled' : ''}>▼</button>
            </td>
            <td class="td-actions" style="text-align: center;">
                <button class="btn-admin btn-admin-primary btn-sm btn-edit" data-col="serviceSchedule" data-id="${item.id}">✏️ Edit</button>
                <button class="btn-admin btn-admin-danger btn-sm btn-del" data-col="serviceSchedule" data-id="${item.id}">🗑️</button>
            </td>
        </tr>
    `).join("");

    bindTableActions(tbody);

    tbody.querySelectorAll(".btn-order").forEach(btn => {
        btn.addEventListener("click", () => {
            const direction = btn.getAttribute("data-direction");
            const idx = parseInt(btn.getAttribute("data-idx"));
            moveScheduleCard(sorted, idx, direction);
        });
    });
}

/**
 * Handle reordering index swapping
 */
async function moveScheduleCard(sorted, index, direction) {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentItem = sorted[index];
    const targetItem = sorted[targetIndex];

    // Swap order values
    const tempOrder = currentItem.order || (index + 1);
    currentItem.order = targetItem.order || (targetIndex + 1);
    targetItem.order = tempOrder;

    if (isFirebaseConfigured && db) {
        try {
            await Promise.all([
                updateDoc(doc(db, "serviceSchedule", currentItem.id), { order: currentItem.order }),
                updateDoc(doc(db, "serviceSchedule", targetItem.id), { order: targetItem.order })
            ]);
            showToast("✨ Display order updated in Firestore!", "success");
        } catch (error) {
            console.error("Reordering error:", error);
            showToast("❌ Failed to update order in Firestore.", "error");
        }
    } else {
        // Local state swap
        const idx1 = cachedData.serviceSchedule.findIndex(x => x.id === currentItem.id);
        const idx2 = cachedData.serviceSchedule.findIndex(x => x.id === targetItem.id);
        if (idx1 > -1) cachedData.serviceSchedule[idx1].order = currentItem.order;
        if (idx2 > -1) cachedData.serviceSchedule[idx2].order = targetItem.order;
        
        // Persist to local mock memory
        localStorage.setItem("mfckim_mock_serviceSchedule", JSON.stringify(cachedData.serviceSchedule));
        showToast("✨ Display order updated locally (Demo Mode)!", "success");
    }

    await loadAllDashboardData();
}

function bindTableActions(tbody) {
    tbody.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", () => openEditModal(btn.getAttribute("data-col"), btn.getAttribute("data-id")));
    });
    tbody.querySelectorAll(".btn-del").forEach(btn => {
        btn.addEventListener("click", () => deleteRecord(btn.getAttribute("data-col"), btn.getAttribute("data-id")));
    });
}

/**
 * Modal CRUD Handlers
 */
function initModalHandlers() {
    const modal = document.querySelector("#admin-modal");
    const closeBtn = document.querySelector("#btn-close-modal");
    const cancelBtn = document.querySelector("#btn-cancel-modal");
    const form = document.querySelector("#admin-modal-form");

    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    if (cancelBtn) cancelBtn.addEventListener("click", () => modal.classList.remove("active"));

    // Message modal close
    const msgModal = document.querySelector("#msg-modal");
    document.querySelector("#btn-close-msg-modal")?.addEventListener("click", () => msgModal.classList.remove("active"));
    document.querySelector("#btn-close-msg-modal-footer")?.addEventListener("click", () => msgModal.classList.remove("active"));

    // Add buttons
    document.querySelector("#btn-add-blog")?.addEventListener("click", () => openEditModal("blogs", null));
    document.querySelector("#btn-add-activity")?.addEventListener("click", () => openEditModal("activities", null));
    document.querySelector("#btn-add-gallery")?.addEventListener("click", () => openEditModal("gallery", null));
    document.querySelector("#btn-add-song")?.addEventListener("click", () => openEditModal("songs", null));
    document.querySelector("#btn-add-file")?.addEventListener("click", () => openEditModal("files", null));
    document.querySelector("#btn-add-member")?.addEventListener("click", () => openEditModal("members", null));
    document.querySelector("#btn-add-schedule")?.addEventListener("click", () => openEditModal("serviceSchedule", null));

    if (form) {
        form.addEventListener("submit", async () => {
            const submitBtn = form.querySelector("button[type='submit']");
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = "⏳ Uploading to GitHub & Saving...";

            try {
                let formData = getModalFormData(currentCollection);

                // Handle file upload for Songs
                if (currentCollection === "songs") {
                    const fileInput = document.getElementById("f-file");
                    const record = currentEditId ? cachedData.songs.find(x => x.id === currentEditId) : {};
                    let fileUrl = record.fileUrl || "";

                    if (fileInput && fileInput.files.length > 0) {
                        const file = fileInput.files[0];
                        if (isGitHubConfigured) {
                            fileUrl = await uploadToGitHub(file, "uploads/songs/");
                        } else {
                            // Local FileReader fallback for Demo Mode
                            fileUrl = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.readAsDataURL(file);
                            });
                        }
                    }
                    formData.fileUrl = fileUrl;
                }

                // Handle file upload for standard Resource files
                if (currentCollection === "files") {
                    const fileInput = document.getElementById("f-url-file");
                    const record = currentEditId ? cachedData.files.find(x => x.id === currentEditId) : {};
                    let fileUrl = record.fileUrl || "#";

                    if (fileInput && fileInput.files.length > 0) {
                        const file = fileInput.files[0];
                        if (isGitHubConfigured) {
                            fileUrl = await uploadToGitHub(file, "uploads/files/");
                        } else {
                            fileUrl = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.readAsDataURL(file);
                            });
                        }
                    }
                    formData.fileUrl = fileUrl;
                }

                // Handle file upload for Gallery
                if (currentCollection === "gallery") {
                    const fileInput = document.getElementById("f-gallery-file");
                    const record = currentEditId ? cachedData.gallery.find(x => x.id === currentEditId) : {};
                    let imageUrl = formData.imageUrl || record.imageUrl || IMAGE_PLACEHOLDER;

                    if (fileInput && fileInput.files.length > 0) {
                        const file = fileInput.files[0];
                        if (isGitHubConfigured) {
                            imageUrl = await uploadToGitHub(file, "uploads/gallery/");
                        } else {
                            imageUrl = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.readAsDataURL(file);
                            });
                        }
                    }
                    formData.imageUrl = imageUrl;
                }

                // Handle file upload for Blogs cover image
                if (currentCollection === "blogs") {
                    const fileInput = document.getElementById("f-cover-file");
                    const record = currentEditId ? cachedData.blogs.find(x => x.id === currentEditId) : {};
                    let coverImage = formData.coverImage || record.coverImage || IMAGE_PLACEHOLDER;

                    if (fileInput && fileInput.files.length > 0) {
                        const file = fileInput.files[0];
                        if (isGitHubConfigured) {
                            coverImage = await uploadToGitHub(file, "uploads/blogs/");
                        } else {
                            coverImage = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.readAsDataURL(file);
                            });
                        }
                    }
                    formData.coverImage = coverImage;
                }

                // Handle file upload for Members directory
                if (currentCollection === "members") {
                    const fileInput = document.getElementById("f-member-file");
                    const record = currentEditId ? cachedData.members.find(x => x.id === currentEditId) : {};
                    let photo = formData.photo || record.photo || AVATAR_PLACEHOLDER;

                    if (fileInput && fileInput.files.length > 0) {
                        const file = fileInput.files[0];
                        if (isGitHubConfigured) {
                            photo = await uploadToGitHub(file, "uploads/members/");
                        } else {
                            photo = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.readAsDataURL(file);
                            });
                        }
                    }
                    formData.photo = photo;
                }

                if (isFirebaseConfigured && db) {
                    const colRef = collection(db, currentCollection);
                    if (currentEditId) {
                        await updateDoc(doc(db, currentCollection, currentEditId), formData);
                        showToast("✨ Record updated in Firestore!", "success");
                    } else {
                        await addDoc(colRef, { ...formData, createdAt: new Date().toISOString() });
                        showToast("✨ New record created in Firestore!", "success");
                    }
                } else {
                    // Demo Mode Local Save
                    if (currentEditId) {
                        const idx = cachedData[currentCollection].findIndex(x => x.id === currentEditId);
                        if (idx > -1) cachedData[currentCollection][idx] = { ...cachedData[currentCollection][idx], ...formData };
                    } else {
                        const newId = currentCollection.slice(0,3) + "-" + Date.now();
                        cachedData[currentCollection].unshift({ id: newId, ...formData, createdAt: new Date().toISOString() });
                    }
                    localStorage.setItem(`mfckim_mock_${currentCollection}`, JSON.stringify(cachedData[currentCollection]));
                    showToast("✨ Record saved locally in Demo Mode!", "success");
                }

                modal.classList.remove("active");
                await loadAllDashboardData();
            } catch (error) {
                console.error("Save error:", error);
                showToast("❌ Failed to save record: " + error.message, "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
}

function openEditModal(colName, id) {
    currentCollection = colName;
    currentEditId = id;
    const modal = document.querySelector("#admin-modal");
    const titleEl = document.querySelector("#modal-title");
    const fieldsContainer = document.querySelector("#modal-form-fields");

    const record = id ? cachedData[colName].find(x => x.id === id) : {};
    titleEl.textContent = id ? `✏️ Edit ${colName.replace("serviceSchedule", "Schedule Card")}` : `➕ Add New ${colName.replace("serviceSchedule", "Schedule Card")}`;

    fieldsContainer.innerHTML = buildFormFields(colName, record || {});
    modal.classList.add("active");
}

function buildFormFields(colName, r) {
    const inp = (label, id, val, type="text", req=true) => `
        <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">${label} ${req?'*':''}</label>
            <input type="${type}" id="${id}" value="${val||''}" class="form-control" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px;" ${req?'required':''}>
        </div>
    `;
    const txt = (label, id, val, rows=4, req=true) => `
        <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">${label} ${req?'*':''}</label>
            <textarea id="${id}" rows="${rows}" class="form-control" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; font-family: inherit;" ${req?'required':''}>${val||''}</textarea>
        </div>
    `;

    if (colName === "blogs") {
        return inp("Article Title", "f-title", r.title) +
               inp("Cover Image URL", "f-cover", r.coverImage, "url", false) +
               `<div style="margin-bottom: 16px;">
                   <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Or Upload Cover Image File (Max 5MB)</label>
                   <input type="file" id="f-cover-file" accept="image/*" style="width: 100%; padding: 8px 0;">
               </div>` +
               inp("Author Name", "f-author", r.author || "Pastor Joel Kim") +
               txt("Short Excerpt Summary", "f-excerpt", r.excerpt, 2) +
               txt("Full Article Content (Paragraphs separated by empty line)", "f-content", r.content, 6) +
               `<div style="margin-bottom: 16px;">
                   <label><input type="checkbox" id="f-published" ${r.published !== false ? 'checked' : ''}> Published on Website</label>
               </div>`;
    }
    if (colName === "activities") {
        return inp("Event Title", "f-title", r.title) +
               inp("Event Date & Time (ISO format e.g. 2026-08-15T18:00)", "f-date", r.eventDate) +
               inp("Location", "f-loc", r.location || "MFC KIM Sanctuary") +
               inp("Event Photo URL", "f-img", r.image, "url", false) +
               txt("Event Description", "f-desc", r.description, 3) +
               `<div style="margin-bottom: 16px;">
                   <label><input type="checkbox" id="f-upcoming" ${r.isUpcoming !== false ? 'checked' : ''}> Mark as Upcoming Event</label>
               </div>`;
    }
    if (colName === "gallery") {
        return inp("Photograph Image URL", "f-img", r.imageUrl, "url", false) +
               `<div style="margin-bottom: 16px;">
                   <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Or Upload Image File (Max 5MB)</label>
                   <input type="file" id="f-gallery-file" accept="image/*" style="width: 100%; padding: 8px 0;">
               </div>` +
               inp("Photo Caption", "f-caption", r.caption) +
               `<div style="margin-bottom: 16px;">
                   <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Category *</label>
                   <select id="f-cat" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px;">
                       <option value="Services" ${r.category === 'Services' ? 'selected' : ''}>🙏 Worship Services</option>
                       <option value="Outreach" ${r.category === 'Outreach' ? 'selected' : ''}>🤝 Community Outreach</option>
                       <option value="Youth" ${r.category === 'Youth' ? 'selected' : ''}>🔥 Youth & Fellowship</option>
                   </select>
               </div>`;
    }
    if (colName === "songs") {
        return inp("Song Title", "f-title", r.title) +
               `<div style="margin-bottom: 16px;">
                   <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Category *</label>
                   <select id="f-cat" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px;">
                       <option value="Hymn" ${r.category === 'Hymn' ? 'selected' : ''}>📜 Hymn</option>
                       <option value="Worship" ${r.category === 'Worship' ? 'selected' : ''}>🙏 Worship Song</option>
                       <option value="Choir" ${r.category === 'Choir' ? 'selected' : ''}>👥 Choir Special</option>
                   </select>
               </div>` +
               `<div style="margin-bottom: 16px;">
                   <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Upload Lyric PDF Sheet (Max 5MB) *</label>
                   <input type="file" id="f-file" accept="application/pdf" style="width: 100%; padding: 8px 0;" ${r.fileUrl ? '' : 'required'}>
                   ${r.fileUrl ? `<p style="font-size: 12px; color: var(--admin-gold); margin-top: 4px;">Current File: <a href="${r.fileUrl}" target="_blank">View PDF</a></p>` : ''}
               </div>`;
    }
    if (colName === "files") {
        return inp("Document Title", "f-title", r.title) +
               `<div style="margin-bottom: 16px;">
                   <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Upload Resource File (PDF) *</label>
                   <input type="file" id="f-url-file" accept="application/pdf" style="width: 100%; padding: 8px 0;" ${r.fileUrl ? '' : 'required'}>
                   ${r.fileUrl && r.fileUrl !== '#' ? `<p style="font-size: 12px; color: var(--admin-gold); margin-top: 4px;">Current PDF: <a href="${r.fileUrl}" target="_blank">View PDF</a></p>` : ''}
               </div>` +
               inp("File Size & Type Details (e.g. PDF - 1.5 MB)", "f-type", r.fileType || "PDF") +
               `<div style="margin-bottom: 16px;">
                   <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Category *</label>
                   <select id="f-cat" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px;">
                       <option value="Bulletins" ${r.category === 'Bulletins' ? 'selected' : ''}>📜 Worship Bulletins</option>
                       <option value="Prayer Guides" ${r.category === 'Prayer Guides' ? 'selected' : ''}>🙏 Prayer Guides</option>
                       <option value="Forms" ${r.category === 'Forms' ? 'selected' : ''}>📝 Forms & Registration</option>
                       <option value="Study Notes" ${r.category === 'Study Notes' ? 'selected' : ''}>📖 Study Notes</option>
                   </select>
               </div>`;
    }
    if (colName === "members") {
        return inp("Display Order (Number e.g. 1, 2, 3)", "f-order", r.order || 1, "number") +
               inp("Full Name", "f-name", r.name) +
               inp("Ministry Title / Role", "f-role", r.role || "Elder") +
               inp("Profile Photo URL", "f-photo", r.photo, "url", false) +
               `<div style="margin-bottom: 16px;">
                   <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">Or Upload Portrait Photo File (Max 5MB)</label>
                   <input type="file" id="f-member-file" accept="image/*" style="width: 100%; padding: 8px 0;">
               </div>` +
               txt("Short Bio Summary", "f-bio", r.bio, 3, false);
    }
    if (colName === "serviceSchedule") {
        return inp("Emoji Icon (e.g. 🙏, 📖, ✨)", "f-icon", r.icon || "⛪") +
               inp("Service Name / Title", "f-title", r.title) +
               inp("Service Time Details (e.g. Sunday 9:00 AM)", "f-time", r.time) +
               txt("Short Description", "f-desc", r.description, 3) +
               inp("Display Order (Number)", "f-order", r.order || (cachedData.serviceSchedule ? cachedData.serviceSchedule.length + 1 : 1), "number");
    }
    return "";
}

function getModalFormData(colName) {
    const val = (id) => document.getElementById(id)?.value.trim();
    const chk = (id) => document.getElementById(id)?.checked;

    if (colName === "blogs") {
        const title = val("f-title");
        return {
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
            coverImage: val("f-cover") || IMAGE_PLACEHOLDER,
            author: val("f-author"),
            excerpt: val("f-excerpt"),
            content: val("f-content"),
            published: chk("f-published")
        };
    }
    if (colName === "activities") {
        return {
            title: val("f-title"),
            eventDate: val("f-date"),
            location: val("f-loc"),
            image: val("f-img") || IMAGE_PLACEHOLDER,
            description: val("f-desc"),
            isUpcoming: chk("f-upcoming")
        };
    }
    if (colName === "gallery") {
        return {
            imageUrl: val("f-img") || IMAGE_PLACEHOLDER,
            caption: val("f-caption"),
            category: val("f-cat"),
            uploadedAt: new Date().toISOString().split('T')[0]
        };
    }
    if (colName === "songs") {
        return {
            title: val("f-title"),
            category: val("f-cat")
        };
    }
    if (colName === "files") {
        return {
            title: val("f-title"),
            fileType: val("f-type"),
            category: val("f-cat"),
            uploadedAt: new Date().toISOString().split('T')[0]
        };
    }
    if (colName === "members") {
        return {
            order: Number(val("f-order")) || 99,
            name: val("f-name"),
            role: val("f-role"),
            photo: val("f-photo") || AVATAR_PLACEHOLDER,
            bio: val("f-bio")
        };
    }
    if (colName === "serviceSchedule") {
        return {
            icon: val("f-icon") || "⛪",
            title: val("f-title"),
            time: val("f-time"),
            description: val("f-desc"),
            order: Number(val("f-order")) || 99
        };
    }
    return {};
}

async function deleteRecord(colName, id) {
    if (!confirm(`Are you sure you want to permanently delete this record from ${colName === "serviceSchedule" ? "Worship Schedule" : colName}?`)) return;

    if (isFirebaseConfigured && db) {
        try {
            await deleteDoc(doc(db, colName, id));
            showToast("🗑️ Record deleted from Firestore.", "success");
        } catch (error) {
            console.error("Delete error:", error);
            showToast("❌ Failed to delete record.", "error");
        }
    } else {
        cachedData[colName] = cachedData[colName].filter(x => x.id !== id);
        localStorage.setItem(`mfckim_mock_${colName}`, JSON.stringify(cachedData[colName]));
        showToast("🗑️ Record deleted locally (Demo Mode).", "success");
    }

    await loadAllDashboardData();
}

/**
 * 1-Click Seed Demo Data Tool
 */
function initSeedTool() {
    const seedBtn = document.querySelector("#btn-seed-firestore");
    const statusEl = document.querySelector("#seed-status");

    if (!seedBtn) return;

    seedBtn.addEventListener("click", async () => {
        if (!confirm("Are you ready to seed all default MFC KIM records into your cloud database?")) return;

        seedBtn.disabled = true;
        seedBtn.innerHTML = "⏳ Seeding demo data across all collections...";
        statusEl.style.color = "var(--admin-gold)";
        statusEl.textContent = "Please wait, writing records to Firestore...";

        if (isFirebaseConfigured && db) {
            try {
                // Seed Settings
                await setDoc(doc(db, "settings", "site"), MOCK_DATA.settings.site, { merge: true });

                // Seed Collections
                const cols = ["blogs", "activities", "gallery", "members", "songs", "files", "messages", "serviceSchedule"];
                for (const col of cols) {
                    const colRef = collection(db, col);
                    for (const item of MOCK_DATA[col]) {
                        await addDoc(colRef, item);
                    }
                }

                statusEl.style.color = "var(--admin-success)";
                statusEl.textContent = "🎉 Success! Your Firebase Firestore database is now fully populated with MFC KIM data!";
                showToast("🚀 Complete demo data seeded successfully!", "success");
            } catch (error) {
                console.error("Seeding error:", error);
                statusEl.style.color = "var(--admin-danger)";
                statusEl.textContent = "❌ Seeding failed: " + error.message;
                showToast("❌ Seeding failed.", "error");
            }
        } else {
            // Demo mode simulation
            setTimeout(() => {
                statusEl.style.color = "var(--admin-success)";
                statusEl.textContent = "🎉 Simulated Seed Success! (In Demo Mode, sample data is already active across all pages). Once your real Firebase keys are inserted in js/firebase-config.js, clicking this button will upload these records to your cloud database.";
                showToast("✨ Demo seed simulation completed!", "success");
            }, 1000);
        }

        seedBtn.disabled = false;
        seedBtn.innerHTML = "🚀 Seed Complete Demo Data Now";
        await loadAllDashboardData();
    });
}

/**
 * Clean/Reset Firestore Tool
 */
function initClearTool() {
    const clearBtn = document.querySelector("#btn-clear-firestore");
    const statusEl = document.querySelector("#clear-status");

    if (!clearBtn) return;

    clearBtn.addEventListener("click", async () => {
        if (!confirm("⚠️ WARNING: This will permanently delete all entries in blogs, activities, gallery, leadership profiles, song sheets, resources, gatherings schedule, and messages.\n\nAre you absolutely sure you want to proceed?")) return;
        if (!confirm("LAST CONFIRMATION: Do you want to wipe all Firestore collections now?")) return;

        clearBtn.disabled = true;
        clearBtn.innerHTML = "⏳ Clearing Firestore collections...";
        statusEl.style.color = "var(--admin-gold)";
        statusEl.textContent = "Deleting documents from Firestore...";

        if (isFirebaseConfigured && db) {
            try {
                const cols = ["blogs", "activities", "gallery", "members", "songs", "files", "messages", "serviceSchedule"];
                for (const col of cols) {
                    const colRef = collection(db, col);
                    const snapshot = await getDocs(colRef);
                    const deletePromises = [];
                    snapshot.forEach(docSnap => {
                        deletePromises.push(deleteDoc(doc(db, col, docSnap.id)));
                    });
                    await Promise.all(deletePromises);
                }

                statusEl.style.color = "var(--admin-success)";
                statusEl.textContent = "🗑️ All documents successfully deleted from Firestore!";
                showToast("🧹 Firestore reset completed successfully!", "success");
            } catch (error) {
                console.error("Clearing database error:", error);
                statusEl.style.color = "var(--admin-danger)";
                statusEl.textContent = "❌ Reset failed: " + error.message;
                showToast("❌ Database reset failed.", "error");
            }
        } else {
            // Demo mode reset
            setTimeout(() => {
                const cols = ["blogs", "activities", "gallery", "members", "songs", "files", "messages", "serviceSchedule"];
                cols.forEach(col => {
                    cachedData[col] = [];
                    localStorage.setItem(`mfckim_mock_${col}`, "[]");
                });
                statusEl.style.color = "var(--admin-success)";
                statusEl.textContent = "🗑️ Demo collections cleared successfully!";
                showToast("🧹 Local data cleared (Demo Mode)!", "success");
            }, 1000);
        }

        clearBtn.disabled = false;
        clearBtn.innerHTML = "🗑️ Delete All Firestore Data & Clean Reset";
        await loadAllDashboardData();
    });
}

/**
 * Toast notification helper
 */
function showToast(msg, type="success") {
    const container = document.querySelector("#toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
