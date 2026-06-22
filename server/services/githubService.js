const axios = require("axios");

function parseRepo(url) {
  const clean = url.replace("https://github.com/", "").replace(/\/$/, "");
  const [owner, repo] = clean.split("/");
  return { owner, repo };
}

async function fetchRepoTree(url) {
  const { owner, repo } = parseRepo(url);

  // Fallback branch logic or just use default branch? 
  // Let's get the default branch first.
  let defaultBranch = "main";
  try {
    const repoInfo = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
    defaultBranch = repoInfo.data.default_branch;
  } catch (e) {
    console.log("Could not get default branch, falling back to main");
  }

  const api = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;

  const res = await axios.get(api);

  return res.data.tree
    .filter(f => f.type === "blob" && (f.path.endsWith(".js") || f.path.endsWith(".ts") || f.path.endsWith(".jsx") || f.path.endsWith(".tsx")))
    .map(f => ({ path: f.path, url: `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${f.path}` }));
}

async function fetchFileContents(files) {
  const fileContents = {};
  
  // To avoid hitting limits too hard, we can just Promise.all
  // For a production app, we'd use p-limit or a queue.
  const promises = files.map(async (file) => {
    try {
      const res = await axios.get(file.url);
      fileContents[file.path] = res.data;
    } catch (err) {
      console.error(`Failed to fetch ${file.path}`);
      fileContents[file.path] = ""; // empty on fail
    }
  });

  await Promise.all(promises);
  return fileContents;
}

module.exports = { fetchRepoTree, fetchFileContents };