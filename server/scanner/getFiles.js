const fg = require("fast-glob");

metrics.files = files.length;

async function getFiles() {
  const files = await fg(["**/*.js"], {
    ignore: ["node_modules"]
  });

  return files;
}

module.exports = getFiles;