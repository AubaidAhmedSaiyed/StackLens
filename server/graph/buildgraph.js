const extractDependencies = require("../parser/extractDependencies");
const resolveImport = require("../../utils/resolvePath");

function buildGraph(fileContents) {
  const graph = {};
  const files = Object.keys(fileContents);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const code = fileContents[file];

    const result = extractDependencies(code, file);
    const resolvedImports = [];

    for (let j = 0; j < result.imports.length; j++) {
      const imp = result.imports[j];

      // pass files array to help resolve relative paths
      const resolved = resolveImport(imp, files, file);
      if (resolved) {
         resolvedImports.push(resolved);
      }
    }

    graph[file] = resolvedImports;
  }

  return graph;
}

module.exports = buildGraph;