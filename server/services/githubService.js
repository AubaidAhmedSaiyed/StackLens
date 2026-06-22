const axios = require("axios");
const http = require("http");
const https = require("https");
const pLimit = require("p-limit");

// Keep connections alive to reduce TLS handshake overhead across chunks
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const axiosInstance = axios.create({
  httpAgent,
  httpsAgent
});

function parseRepo(url) {
  const clean = url.replace("https://github.com/", "").replace(/\/$/, "");
  const [owner, repo] = clean.split("/");
  return { owner, repo };
}

async function fetchRepoTree(url) {
  const { owner, repo } = parseRepo(url);

  let defaultBranch = "main";
  try {
    const repoInfo = await axiosInstance.get(`https://api.github.com/repos/${owner}/${repo}`);
    defaultBranch = repoInfo.data.default_branch;
  } catch (e) {
    console.log("Could not get default branch, falling back to main");
  }

  const api = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
  const res = await axiosInstance.get(api);

  return res.data.tree
    .filter(f => f.type === "blob" && (f.path.endsWith(".js") || f.path.endsWith(".ts") || f.path.endsWith(".jsx") || f.path.endsWith(".tsx")))
    .map(f => ({ path: f.path, url: `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${f.path}` }));
}

async function fetchFileContents(files) {
  const fileContents = {};
  
  // Limit concurrent network requests to 25 to prevent ECONNRESET and 429s
  const limit = pLimit(25); 

  const promises = files.map(file => limit(async () => {
    try {
      const res = await axiosInstance.get(file.url);
      fileContents[file.path] = res.data;
    } catch (err) {
      console.error(`Failed to fetch ${file.path}`);
      fileContents[file.path] = ""; // empty on fail
    }
  }));

  await Promise.all(promises);
  return fileContents;
}

module.exports = { fetchRepoTree, fetchFileContents };