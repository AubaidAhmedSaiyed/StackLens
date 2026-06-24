const axios = require('axios');
const pLimit = require('p-limit');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '../../.cache');

// Use an authorized instance if a token is present, otherwise fallback
const token = process.env.GITHUB_TOKEN;
const axiosInstance = axios.create({
  headers: token ? { Authorization: `token ${token}` } : {}
});

function parseRepo(url) {
  const parts = url.replace("https://github.com/", "").split("/");
  const owner = parts[0];
  const repo = parts[1].replace(".git", "");
  return { owner, repo };
}

async function fetchRepoTree(url) {
  const { owner, repo } = parseRepo(url);
  const repoName = `${owner}-${repo}`;
  const repoCacheDir = path.join(CACHE_DIR, repoName);
  const treeCacheFile = path.join(repoCacheDir, 'tree.json');

  // Check SSD Cache
  if (fs.existsSync(treeCacheFile)) {
    const cachedFiles = JSON.parse(fs.readFileSync(treeCacheFile, 'utf8'));
    return cachedFiles;
  }

  if (!fs.existsSync(repoCacheDir)) {
    fs.mkdirSync(repoCacheDir, { recursive: true });
  }

  let defaultBranch = "main";
  try {
    const repoInfo = await axiosInstance.get(`https://api.github.com/repos/${owner}/${repo}`);
    defaultBranch = repoInfo.data.default_branch;
  } catch (e) {
    console.log("Could not get default branch, falling back to main");
  }

  const api = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
  const res = await axiosInstance.get(api);

  const files = res.data.tree
    .filter(f => f.type === "blob" && (f.path.endsWith(".js") || f.path.endsWith(".ts") || f.path.endsWith(".jsx") || f.path.endsWith(".tsx")))
    .map(f => ({ path: f.path, url: `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${f.path}`, repoName }));

  // Save to SSD Cache
  fs.writeFileSync(treeCacheFile, JSON.stringify(files), 'utf8');

  return files;
}

async function fetchFileContents(files) {
  const fileContents = {};
  let isColdRun = false;
  
  if (files.length === 0) return { contents: fileContents, isColdRun };

  const repoName = files[0].repoName;
  const repoCacheDir = path.join(CACHE_DIR, repoName);
  
  if (!fs.existsSync(repoCacheDir)) {
    fs.mkdirSync(repoCacheDir, { recursive: true });
  }
  
  // Limit concurrent network requests to 25 to prevent ECONNRESET and 429s
  const limit = pLimit(25);
  
  const fetchPromises = files.map(file => limit(async () => {
    const filePath = path.join(repoCacheDir, file.path.replace(/\//g, '_'));
    
    // Check SSD Cache
    if (fs.existsSync(filePath)) {
      fileContents[file.path] = fs.readFileSync(filePath, 'utf8');
      return;
    }
    
    // Cache Miss -> Fetch from API (Cold Run)
    isColdRun = true;
    try {
      const response = await axiosInstance.get(file.url);
      const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      fileContents[file.path] = data;
      fs.writeFileSync(filePath, data, 'utf8');
    } catch (e) {
      console.error(`Failed to fetch ${file.url}:`, e.message);
    }
  }));

  await Promise.all(fetchPromises);
  return { contents: fileContents, isColdRun };
}

module.exports = {
  fetchRepoTree,
  fetchFileContents
};