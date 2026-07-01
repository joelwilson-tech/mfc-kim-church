// ==========================================================================
// MFC KIM - GitHub File Storage Configuration
// ==========================================================================
// WARNING: Since this is a static site client application, the GitHub Token
// is visible in the browser's source code.
//
// SECURITY INSTRUCTIONS:
// 1. Generate a "Fine-Grained Personal Access Token (PAT)" on GitHub.
// 2. Select ONLY this specific repository under "Repository access".
// 3. Under "Repository permissions" -> "Contents", grant "Access: Read and write".
// 4. Do NOT grant any other permissions. This restricts the token strictly
//    to uploading/editing files in this repository, protecting your account.
// ==========================================================================

export const GITHUB_CONFIG = {
    OWNER: "joelwilson-tech",                  // e.g. "joel-kim"
    REPO: "mfc-kim-church",                    // e.g. "mfc-kim-website"
    BRANCH: "main",                            // default branch (usually "main" or "master")
    TOKEN: "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" // Fine-grained PAT with Contents R/W permission only
};

// Check if GitHub storage is configured
export const isGitHubConfigured = 
    GITHUB_CONFIG.OWNER !== "YOUR_GITHUB_USERNAME_HERE" &&
    GITHUB_CONFIG.TOKEN !== "YOUR_FINE_GRAINED_TOKEN_HERE";
