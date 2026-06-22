const extractDependencies = require("../parser/extractDependencies");
const resolveImport = require("../../utils/resolvePath");

function buildGraph(fileContents) {
  const graph = {};
  const files = Object.keys(fileContents);
  
  // Pre-compute O(1) Set for fast path resolution to prevent O(N^2) CPU locking
  const filesSet = new Set(files);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const code = fileContents[file];

    const result = extractDependencies(code, file);
    const resolvedImports = [];

    for (let j = 0; j < result.imports.length; j++) {
      const imp = result.imports[j];

      // O(1) resolution via Set
      const resolved = resolveImport(imp, filesSet, file);
      if (resolved) {
         resolvedImports.push(resolved);
      }
    }

    graph[file] = resolvedImports;
  }

  return graph;
}

module.exports = buildGraph;