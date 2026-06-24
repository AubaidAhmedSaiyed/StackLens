const axios = require('axios');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// ==========================================
// CONFIGURATION (Environment variables or defaults)
// ==========================================
const API_URL = process.env.API_URL || 'http://localhost:5000/api/analyze';
const TARGET_REPO = process.env.REPO_URL || 'https://github.com/expressjs/express';
const TOTAL_RUNS = parseInt(process.env.RUNS, 10) || 5;
const WARMUP_RUNS = parseInt(process.env.WARMUP_RUNS, 10) || 1;
const SLEEP_MS = 2000;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const calculatePercentile = (arr, p) => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  if (upper >= sorted.length) return sorted[lower];
  return Math.round(sorted[lower] * (1 - weight) + sorted[upper] * weight);
};

// ==========================================
// MAIN BENCHMARK ENGINE
// ==========================================
async function runBenchmarkSuite() {
  console.log(`\n🚀 Starting Benchmark Suite`);
  console.log(`Target API : ${API_URL}`);
  console.log(`Repository : ${TARGET_REPO}`);
  console.log(`Warmups    : ${WARMUP_RUNS}`);
  console.log(`Measured   : ${TOTAL_RUNS}`);
  console.log(`==========================================\n`);

  const latencies = [];
  const successfulRuns = [];
  let failures = 0;

  const totalIterations = WARMUP_RUNS + TOTAL_RUNS;

  for (let i = 1; i <= totalIterations; i++) {
    const isWarmup = i <= WARMUP_RUNS;
    const runLabel = isWarmup ? `[Warmup ${i}/${WARMUP_RUNS}]` : `[Run ${i - WARMUP_RUNS}/${TOTAL_RUNS}]`;
    
    try {
      const start = performance.now();
      
      const response = await axios.post(API_URL, { url: TARGET_REPO });
      
      const latencyMs = Math.round(performance.now() - start);
      const metrics = response.data.metrics || {};

      console.log(`${runLabel} Success | Latency: ${latencyMs}ms | Nodes: ${metrics.nodes || 0}`);

      if (!isWarmup) {
        latencies.push(latencyMs);
        successfulRuns.push({
          run: i - WARMUP_RUNS,
          latencyMs,
          backendTotalMs: metrics.totalTimeMs || 0,
          backendScanMs: metrics.scanTimeMs || 0,
          backendGraphMs: metrics.graphTimeMs || 0,
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error(`${runLabel} ❌ FAILED | Error: ${errorMessage}`);
      if (!isWarmup) failures++;
    }

    // Cooldown to prevent artificial Node.js garbage collection spikes or API throttling
    if (i < totalIterations) await sleep(SLEEP_MS);
  }

  // ==========================================
  // METRICS COMPUTATION
  // ==========================================
  console.log(`\n📊 Generating Statistical Report...`);
  
  if (latencies.length === 0) {
    console.error("All measured runs failed. Cannot compute statistics.");
    return;
  }

  const successRate = ((TOTAL_RUNS - failures) / TOTAL_RUNS) * 100;
  const sumLatency = latencies.reduce((a, b) => a + b, 0);
  const avgLatency = Math.round(sumLatency / latencies.length);
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);
  const p50Latency = calculatePercentile(latencies, 50); // Median
  const p95Latency = calculatePercentile(latencies, 95);

  const report = {
    timestamp: new Date().toISOString(),
    config: { API_URL, TARGET_REPO, TOTAL_RUNS, WARMUP_RUNS },
    reliability: {
      successRate: `${successRate.toFixed(2)}%`,
      failures,
      successful: TOTAL_RUNS - failures
    },
    latencyStatisticsMs: {
      min: minLatency,
      max: maxLatency,
      average: avgLatency,
      p50_median: p50Latency,
      p95: p95Latency
    },
    rawRuns: successfulRuns
  };

  // ==========================================
  // SAVE RESULTS
  // ==========================================
  const filename = `benchmark_report_${Date.now()}.json`;
  const filepath = path.join(__dirname, filename);
  
  try {
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Benchmark Complete. Results saved to: ${filename}`);
  } catch (err) {
    console.error(`\n❌ Failed to save benchmark results:`, err.message);
  }

  // Print final summary to console
  console.log(`\n--- SUMMARY ---`);
  console.log(`Success Rate : ${successRate}%`);
  console.log(`Avg Latency  : ${avgLatency}ms`);
  console.log(`Median (p50) : ${p50Latency}ms`);
  console.log(`p95 Latency  : ${p95Latency}ms`);
  console.log(`Min / Max    : ${minLatency}ms / ${maxLatency}ms\n`);
}

runBenchmarkSuite();
