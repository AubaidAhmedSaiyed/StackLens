function buildReverseGraph(graph) {
  const reverseGraph = {};

  const files = Object.keys(graph);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const dependencies = graph[file];

    for (let j = 0; j < dependencies.length; j++) {
      const dep = dependencies[j];

      if (!reverseGraph[dep]) {
        reverseGraph[dep] = [];
      }

      reverseGraph[dep].push(file);
    }
  }

  return reverseGraph;
}

module.exports = buildReverseGraph;