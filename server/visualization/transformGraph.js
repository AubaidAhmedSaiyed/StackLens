function transformGraph(graph) {
  const nodes = [];
  const edges = [];

  const files = Object.keys(graph);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    nodes.push({
      id: file,
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500
      }
    });

    const deps = graph[file];

    for (let j = 0; j < deps.length; j++) {
      edges.push({
        id: file + "-" + deps[j],
        source: file,
        target: deps[j]
      });
    }
  }

  return { nodes, edges };
}

module.exports = transformGraph;