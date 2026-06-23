function calculateRepositoryStats(graph) {
  let mostCoupledFile = null;
  let maxDeps = 0;

  for (const [file, deps] of Object.entries(graph)) {
    if (deps.length > maxDeps) {
      maxDeps = deps.length;
      mostCoupledFile = file;
    }
  }

  return {
    mostCoupledFile: mostCoupledFile ? mostCoupledFile.split('/').pop() : 'None',
    maxDependencies: maxDeps
  };
}

module.exports = calculateRepositoryStats;
