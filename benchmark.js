const axios = require('axios');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://github.com/expressjs/express';
const RUNS = 3; // Number of times to hit the endpoint

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBenchmark(phase) {
  console.log(`Starting ${phase} benchmark against ${TARGET_URL} for ${RUNS} runs...`);
  
  const metricsList = [];
  
  for (let i = 0; i < RUNS; i++) {
    console.log(`Run ${i + 1}/${RUNS}...`);
    try {
      const start = performance.now();
      
      const response = await axios.post('http://localhost:5000/api/analyze', { url: TARGET_URL });
      
      const totalTimeMs = performance.now() - start;
      const metrics = response.data.metrics;
      
      metricsList.push({
        run: i + 1,
        totalRoundTripMs: totalTimeMs,
        backendScanTimeMs: metrics.scanTimeMs,
        backendGraphTimeMs: metrics.graphTimeMs,
        backendTotalTimeMs: metrics.totalTimeMs,
        filesScanned: metrics.filesScanned,
        nodes: metrics.nodes,
        edges: metrics.edges
      });
      
      // Wait a bit to let the server recover/cool down between runs
      await sleep(2000);
      
    } catch (err) {
      console.error(`Run ${i + 1} failed:`, err.response?.data || err.message);
    }
  }
  
  // Calculate averages
  if (metricsList.length === 0) {
    console.error("All runs failed. Benchmark aborted.");
    return;
  }
  
  const avg = {
    totalRoundTripMs: metricsList.reduce((acc, curr) => acc + curr.totalRoundTripMs, 0) / metricsList.length,
    backendScanTimeMs: metricsList.reduce((acc, curr) => acc + curr.backendScanTimeMs, 0) / metricsList.length,
    backendGraphTimeMs: metricsList.reduce((acc, curr) => acc + curr.backendGraphTimeMs, 0) / metricsList.length,
    backendTotalTimeMs: metricsList.reduce((acc, curr) => acc + curr.backendTotalTimeMs, 0) / metricsList.length,
  };
  
  const finalResult = {
    repo: TARGET_URL,
    phase: phase,
    timestamp: new Date().toISOString(),
    runs: RUNS,
    averages: avg,
    rawRuns: metricsList
  };
  
  const filename = `metrics_${phase.toLowerCase()}.json`;
  const filepath = path.join(__dirname, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(finalResult, null, 2));
  console.log(`Benchmark completed. Results saved to ${filepath}`);
  console.log('Averages:', avg);
}

const args = process.argv.slice(2);
const phase = args[0] || 'before';

runBenchmark(phase);
