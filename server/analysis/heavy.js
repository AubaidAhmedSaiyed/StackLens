function findHeavyModules(graph, limit = 5) {
  const heavy = [];

  const files = Object.keys(graph);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (graph[file].length > limit) {
      heavy.push(file);
    }
  }

  return heavy;
}

module.exports = findHeavyModules;