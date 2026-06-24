const { performance } = require('perf_hooks');
const extractDependencies = require("../parser/extractDependencies");
const resolveImport = require("../../utils/resolvePath");

function buildGraph(fileContents) {
  const files = Object.keys(fileContents);
  const astResults = {};
  
  // 1. AST Parsing Stage
  const astStart = performance.now();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const code = fileContents[file];
    astResults[file] = extractDependencies(code, file);
  }
  const astEnd = performance.now();

  // 2. Graph Construction Stage
  const buildStart = performance.now();
  const graph = {};
  const filesSet = new Set(files);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = astResults[file];
    const resolvedImports = [];

    for (let j = 0; j < result.imports.length; j++) {
      const imp = result.imports[j];
      const resolved = resolveImport(imp, filesSet, file);
      if (resolved) {
         resolvedImports.push(resolved);
      }
    }
    graph[file] = resolvedImports;
  }
  const buildEnd = performance.now();

  return { 
    graph, 
    astStart, astEnd,
    buildStart, buildEnd 
  };
}

module.exports = buildGraph;