function findDeadFiles(graph, reverseGraph) {
  const dead = [];

  const files = Object.keys(graph);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const incoming = reverseGraph[file] || [];
    const outgoing = graph[file] || [];

    if (incoming.length === 0 && outgoing.length === 0) {
      dead.push(file);
    }
  }

  return dead;
}

module.exports = findDeadFiles;