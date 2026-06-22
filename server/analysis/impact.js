function getImpact(file, reverseGraph) {
  const visited = new Set();
  const queue = [file];
  const affected = [];

  while (queue.length > 0) {
    const current = queue.shift();

    const dependents = reverseGraph[current] || [];

    for (let i = 0; i < dependents.length; i++) {
      const dep = dependents[i];

      if (!visited.has(dep)) {
        visited.add(dep);
        affected.push(dep);
        queue.push(dep);
      }
    }
  }

  return affected;
}

module.exports = getImpact;