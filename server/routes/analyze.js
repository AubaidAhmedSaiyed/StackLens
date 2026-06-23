const express = require('express');
const router = express.Router();

const { fetchRepoTree, fetchFileContents } = require("../services/githubService");
const buildGraph = require("../graph/buildGraph");
const buildReverseGraph = require("../graph/buildReverseGraph");

const circular = require("../analysis/circular");
const heavy = require("../analysis/heavy");
const dead = require("../analysis/dead");
const getImpact = require("../analysis/impact");

const transformGraph = require("../visualization/transformGraph");
const MetricsCollector = require("../metrics/collector");
const repoCache = require("../cache/repoCache");

router.post("/", async (req, res) => {
  const collector = new MetricsCollector();
  
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "GitHub URL is required" });
    }

    // 1. FETCH FROM GITHUB
    const files = await fetchRepoTree(url);
    collector.metrics.filesScanned = files.length;
    
    // limit files for safety in this version (e.g. max 100)
    const limitedFiles = files.slice(0, 100);
    const fileContents = await fetchFileContents(limitedFiles);
    collector.recordLap('scanTimeMs');

    // 2. GRAPH BUILD
    const graph = buildGraph(fileContents);
    const reverseGraph = buildReverseGraph(graph);

    collector.metrics.nodes = Object.keys(graph).length;

    let edgeCount = 0;
    for (let f in graph) edgeCount += graph[f].length;
    collector.metrics.edges = edgeCount;
    collector.recordLap('graphTimeMs');

    // 3. ANALYSIS
    const circ = circular(graph);
    const heavyMods = heavy(graph);
    const deadMods = dead(graph, reverseGraph);

    collector.metrics.circular = circ.length;
    collector.metrics.heavy = heavyMods.length;
    collector.metrics.dead = deadMods.length;

    // 4. VISUALIZATION
    const visual = transformGraph(graph);

    // 5. GRAPH STATS & MOST COUPLED FILE
    const repoStats = require("../metrics/repositoryStats")(graph);
    collector.metrics.mostCoupledFile = repoStats.mostCoupledFile;

    // 6. SIMULATED IMPACT QUERY BENCHMARK
    // We run a BFS on the most coupled file to see how fast the impact engine is under heavy load
    let maxDepth = 0;
    const { performance } = require('perf_hooks');
    const impactStartTime = performance.now();
    
    // Reverse graph lookup simulates what /api/impact does
    const testFile = Object.keys(graph).find(f => f.endsWith(repoStats.mostCoupledFile));
    if (testFile && reverseGraph[testFile]) {
      const visited = new Set([testFile, ...reverseGraph[testFile]]);
      const queue = reverseGraph[testFile].map(d => [d, 1]);
      
      while (queue.length > 0) {
        const [current, depth] = queue.shift();
        maxDepth = Math.max(maxDepth, depth);
        const dependents = reverseGraph[current] || [];
        for (const dep of dependents) {
          if (!visited.has(dep)) {
            visited.add(dep);
            queue.push([dep, depth + 1]);
          }
        }
      }
    }
    const impactDuration = performance.now() - impactStartTime;
    collector.recordCustomTime('impactQueryTimeMs', impactDuration);
    collector.metrics.maxDependencyDepth = maxDepth;

    // 7. CACHE RESULTS FOR IMPACT API
    repoCache.set(graph, reverseGraph, collector.metrics, limitedFiles.map(f => f.path));

    const finalMetrics = collector.end();

    // 8. SAVE TO BENCHMARK HISTORY
    const benchmark = require('../metrics/benchmark');
    benchmark.save(url, finalMetrics);

    // FINAL RESPONSE
    res.json({
      files: limitedFiles.map(f => f.path),
      graph,
      reverseGraph,
      visual,
      analysis: {
        circular: circ,
        heavy: heavyMods,
        dead: deadMods
      },
      metrics: collector.metrics
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Failed to analyze repository", details: error.message });
  }
});

module.exports = router;