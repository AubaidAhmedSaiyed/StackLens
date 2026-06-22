const getFiles = require("./server/scanner/getFiles");
const buildGraph = require("./server/graph/buildGraph");
const buildReverseGraph = require("./server/graph/buildReverseGraph");

const circular = require("./server/analysis/circular");
const heavy = require("./server/analysis/heavy");
const dead = require("./server/analysis/dead");

const transformGraph = require("./server/visualization/transformGraph");
const getImpact = require("./server/analysis/impact");

const { metrics, startTimer, endTimer } = require("./server/metrics/collector");

async function run() {
  startTimer();

  // 1. SCAN
  const scanStart = Date.now();
  const files = await getFiles();
  metrics.filesScanned = files.length;
  metrics.scanTimeMs = Date.now() - scanStart;

  // 2. GRAPH BUILD
  const graphStart = Date.now();
  const graph = buildGraph(files);
  const reverseGraph = buildReverseGraph(graph);
  metrics.nodes = Object.keys(graph).length;
  metrics.graphTimeMs = Date.now() - graphStart;

  // calculate edges
  let edgeCount = 0;
  for (let f in graph) {
    edgeCount += graph[f].length;
  }
  metrics.edges = edgeCount;

  // 3. ANALYSIS
  const circ = circular(graph);
  const heavyMods = heavy(graph);
  const deadMods = dead(graph, reverseGraph);

  metrics.circularDeps = circ.length;
  metrics.heavyModules = heavyMods.length;
  metrics.deadFiles = deadMods.length;

  // 4. VISUALIZATION
  const visual = transformGraph(graph);

  // 5. TOTAL TIME
  metrics.totalTimeMs = endTimer();

  // 6. IMPACT ANALYSIS (NEW)
const changedFile = files[0]; // simulate change

const impactStart = Date.now();
const impactedFiles = getImpact(changedFile, reverseGraph);
const impactTime = Date.now() - impactStart;

// optional metric
metrics.impactTimeMs = impactTime;
metrics.impactedFilesCount = impactedFiles.length;

  // FINAL OUTPUT
  console.log("\n=== STACKLENS METRICS ===");
  console.log(metrics);

  console.log("\n=== VISUAL GRAPH ===");
  console.log(visual);

  console.log("\n=== INSIGHTS ===");
  console.log({
    circular: circ,
    heavy: heavyMods,
    dead: deadMods
  });
    console.log("\n=== IMPACT ANALYSIS ===");
    console.log({
    changedFile,
    impactedFiles
    });
}

run();