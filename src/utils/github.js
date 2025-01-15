const OWNER = "Hyangdian";
const REPO = "TTSKRDB";
const BASE_PATH = "@content";

export async function fetchGitHubContent(path) {
    const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/${path}`
    );
    return await response.text();
}

export async function listFiles() {
    const response = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}`
    );
    return await response.json();
} 