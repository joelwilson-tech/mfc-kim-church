// ==========================================================================
// MFC KIM - GitHub File Storage Module
// Handles file base64 conversion and commits to GitHub repo via Contents API.
// ==========================================================================
import { GITHUB_CONFIG, isGitHubConfigured } from "./github-config.js";

/**
 * Uploads a file directly to the GitHub repository.
 * @param {File} file - The file object to upload.
 * @param {string} folderPath - Target directory (e.g., "uploads/gallery/").
 * @returns {Promise<string>} The raw GitHub user content URL.
 */
export async function uploadToGitHub(file, folderPath) {
    if (!isGitHubConfigured) {
        throw new Error("GitHub storage is not configured yet. Please enter your Personal Access Token in js/github-config.js.");
    }

    // Clean folder path and append unique filename
    let cleanFolder = folderPath.trim();
    if (!cleanFolder.endsWith("/")) {
        cleanFolder += "/";
    }
    if (cleanFolder.startsWith("/")) {
        cleanFolder = cleanFolder.slice(1);
    }
    const path = `${cleanFolder}${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // 1. Convert File to Base64 String
    const base64Content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const rawBase64 = reader.result.split(",")[1];
            resolve(rawBase64);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });

    // 2. Put file to GitHub Contents API
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${path}`;
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `token ${GITHUB_CONFIG.TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
            message: `Upload: ${file.name}`,
            content: base64Content,
            branch: GITHUB_CONFIG.BRANCH
        })
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `GitHub API Upload Error: ${response.status}`);
    }

    // 3. Return Raw GitHub Usercontent URL
    return `https://raw.githubusercontent.com/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/${GITHUB_CONFIG.BRANCH}/${path}`;
}
