function findCircularDependencies(graph) {
  const visited = new Set();
  const stack = new Set();
  const cycles = [];

  function dfs(node, path) {
    if (stack.has(node)) {
      cycles.push([...path, node]);
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    stack.add(node);

    const neighbors = graph[node] || [];

    for (let i = 0; i < neighbors.length; i++) {
      dfs(neighbors[i], [...path, node]);
    }

    stack.delete(node);
  }

  const nodes = Object.keys(graph);

  for (let i = 0; i < nodes.length; i++) {
    dfs(nodes[i], []);
  }

  return cycles;
}

module.exports = findCircularDependencies;