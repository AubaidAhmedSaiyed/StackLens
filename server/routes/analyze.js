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

    // 5. IMPACT SAMPLE (OPTION B)
    const sampleFile = limitedFiles.length > 0 ? limitedFiles[0].path : null;
    const impacted = sampleFile ? getImpact(sampleFile, reverseGraph) : [];

    collector.end();

    // FINAL RESPONSE
    res.json({
      files: limitedFiles.map(f => f.path),
      graph,
      reverseGraph,
      visual,
      analysis: {
        circular: circ,
        heavy: heavyMods,
        dead: deadMods,
        impactSample: {
          file: sampleFile,
          impacted
        }
      },
      metrics: collector.metrics
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Failed to analyze repository", details: error.message });
  }
});

module.exports = router;