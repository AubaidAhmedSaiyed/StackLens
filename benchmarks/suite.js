const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/analyze';
const REPO = 'https://github.com/expressjs/express';

const DIRS = {
  raw: path.join(__dirname, 'raw-runs'),
  memory: path.join(__dirname, 'memory'),
  latency: path.join(__dirname, 'latency'),
  report: path.join(__dirname, 'reports')
};

Object.values(DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const calcPercentile = (arr, p) => {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  if (upper >= sorted.length) return sorted[lower];
  return Math.round(sorted[lower] * (1 - weight) + sorted[upper] * weight);
};

const mean = arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

const saveJson = (dir, name, data) => {
  fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2));
};

async function runBenchmark() {
  console.log(`--- Benchmarking ${REPO} (20 Runs) ---`);
  const metricsList = [];
  let coldRunMetrics = null;

  for (let i = 0; i < 20; i++) {
    try {
      console.log(`[Run ${i + 1}/20] Triggering analysis...`);
      const res = await axios.post(API_URL, { url: REPO });
      const m = res.data.metrics;
      
      saveJson(DIRS.raw, `run_${i + 1}_${Date.now()}.json`, m);
      
      if (m.isColdRun) {
        coldRunMetrics = m;
        console.log(`  -> ❄️ Cold Run Completed (API Fetch)`);
      } else {
        metricsList.push(m);
        console.log(`  -> 🔥 Warm Run Completed (SSD Cache)`);
      }
    } catch (e) {
      console.error(`  -> ❌ Failed:`, e.response?.data || e.message);
    }
  }

  if (metricsList.length === 0) {
    console.error("No warm runs succeeded.");
    return;
  }

  // Aggregate Warm Runs
  const totalAnalysisTimes = metricsList.map(m => m.stages.totalAnalysis.durationMs);
  
  const extractAvgStage = (stageName) => mean(metricsList.map(m => m.stages[stageName].durationMs));
  const extractAvgMem = (key) => mean(metricsList.map(m => m.memory[key]));

  const finalReport = {
    repository: REPO,
    fileCount: metricsList[0].filesScanned,
    nodeCount: metricsList[0].nodes,
    edgeCount: metricsList[0].edges,
    fetchMs: extractAvgStage('githubFetch'),
    astParsingMs: extractAvgStage('astParsing'),
    graphBuildMs: extractAvgStage('graphBuild'),
    bfsMs: extractAvgStage('bfsImpactAnalysis'),
    cycleDetectionMs: extractAvgStage('cycleDetection'),
    deadCodeMs: extractAvgStage('deadCodeDetection'),
    totalAnalysisMs: extractAvgStage('totalAnalysis'),
    peakHeapMB: extractAvgMem('peakHeapMB'),
    averageHeapMB: extractAvgMem('averageHeapMB'),
    finalHeapMB: extractAvgMem('finalHeapMB'),
    rssMB: extractAvgMem('rssMB'),
    statistics: {
      runs: 20,
      min: Math.min(...totalAnalysisTimes),
      max: Math.max(...totalAnalysisTimes),
      mean: mean(totalAnalysisTimes),
      p50: calcPercentile(totalAnalysisTimes, 50),
      p95: calcPercentile(totalAnalysisTimes, 95),
      p99: calcPercentile(totalAnalysisTimes, 99)
    },
    coldRunData: coldRunMetrics ? {
      fetchMs: coldRunMetrics.stages.githubFetch.durationMs,
      totalAnalysisMs: coldRunMetrics.stages.totalAnalysis.durationMs,
      peakHeapMB: coldRunMetrics.memory.peakHeapMB
    } : null
  };

  saveJson(DIRS.report, `final_resume_metrics.json`, finalReport);
  console.log('\n✅ Real-World Benchmark Completed.');
  console.log('Resume Metrics stored in benchmarks/reports/final_resume_metrics.json');
}

runBenchmark();
