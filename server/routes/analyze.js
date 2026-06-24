const express = require('express');
const { performance } = require('perf_hooks');
const router = express.Router();

const { fetchRepoTree, fetchFileContents } = require("../services/githubService");
const buildGraph = require("../graph/buildGraph");
const buildReverseGraph = require("../graph/buildReverseGraph");

const circular = require("../analysis/circular");
const heavy = require("../analysis/heavy");
const dead = require("../analysis/dead");

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
    const fetchStart = performance.now();
    const files = await fetchRepoTree(url);
    collector.metrics.filesScanned = files.length;
    
    const { contents, isColdRun } = await fetchFileContents(files);
    collector.metrics.isColdRun = isColdRun;
    collector.recordStage('githubFetch', fetchStart, performance.now());

    // 2. GRAPH BUILD
    const { graph, astStart, astEnd, buildStart, buildEnd } = buildGraph(contents);
    const reverseGraph = buildReverseGraph(graph);

    collector.recordStage('astParsing', astStart, astEnd);
    collector.recordStage('graphBuild', buildStart, buildEnd);

    collector.metrics.nodes = Object.keys(graph).length;
    let edgeCount = 0;
    for (let f in graph) edgeCount += graph[f].length;
    collector.metrics.edges = edgeCount;

    // 3. ANALYSIS
    const startCirc = performance.now();
    const circ = circular(graph);
    collector.recordStage('cycleDetection', startCirc, performance.now());

    const heavyMods = heavy(graph);

    const startDead = performance.now();
    const deadMods = dead(graph, reverseGraph);
    collector.recordStage('deadCodeDetection', startDead, performance.now());

    // 4. VISUALIZATION
    const visual = transformGraph(graph);

    // 5. GRAPH STATS & MOST COUPLED FILE
    const repoStats = require("../metrics/repositoryStats")(graph);

    // 6. SIMULATED IMPACT QUERY BENCHMARK
    let maxDepth = 0;
    const impactStartTime = performance.now();
    
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
    collector.recordStage('bfsImpactAnalysis', impactStartTime, performance.now());

    // 7. CACHE RESULTS FOR IMPACT API
    repoCache.set(graph, reverseGraph, collector.metrics, files.map(f => f.path));

    const finalMetrics = collector.end();

    // FINAL RESPONSE
    res.json({
      files: files.map(f => f.path),
      graph,
      reverseGraph,
      visual,
      analysis: {
        circular: circ,
        heavy: heavyMods,
        dead: deadMods
      },
      metrics: finalMetrics
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Failed to analyze repository", details: error.message });
  }
});

module.exports = router;