const express = require('express');
const router = express.Router();
const repoCache = require('../cache/repoCache');

router.get('/', (req, res) => {
  const { file } = req.query;
  
  if (!file) {
    return res.status(400).json({ error: "File parameter is required" });
  }

  const { graph, reverseGraph, metrics, files } = repoCache.get();

  if (!reverseGraph || !graph) {
    return res.status(404).json({ error: "No repository analyzed yet. Please run analysis first." });
  }

  if (!graph[file] && !reverseGraph[file]) {
    return res.status(404).json({ error: "File not found in analyzed repository." });
  }

  const directImpact = reverseGraph[file] || [];
  
  // Find indirect impact using BFS
  const indirectImpact = new Set();
  const visited = new Set([file, ...directImpact]);
  let maxDepth = 0;

  // Queue stores [node, depth]
  const queue = directImpact.map(d => [d, 1]);

  // For the dependency chain section
  const chainEdges = [];

  while (queue.length > 0) {
    const [current, depth] = queue.shift();
    maxDepth = Math.max(maxDepth, depth);

    const dependents = reverseGraph[current] || [];
    for (const dep of dependents) {
      chainEdges.push({ source: current, target: dep });
      if (!visited.has(dep)) {
        visited.add(dep);
        indirectImpact.add(dep);
        queue.push([dep, depth + 1]);
      }
    }
  }

  // Calculate affected modules based on root directory names
  const allAffected = [...directImpact, ...Array.from(indirectImpact)];
  const moduleSet = new Set();
  allAffected.forEach(f => {
    const parts = f.split('/');
    if (parts.length > 1) {
      // Capitalize first letter for better readability
      const mod = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      moduleSet.add(mod);
    } else {
      moduleSet.add("Root");
    }
  });

  res.json({
    selectedFile: file,
    directImpact,
    indirectImpact: Array.from(indirectImpact),
    chainEdges, // edges starting from direct impacts and propagating downwards
    impactSummary: {
      totalAffected: directImpact.length + indirectImpact.size,
      directCount: directImpact.length,
      indirectCount: indirectImpact.size,
      dependencyDepth: maxDepth,
      affectedModules: Array.from(moduleSet)
    },
    repositoryContext: metrics
  });
});

module.exports = router;