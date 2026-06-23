const fs = require('fs');
const path = require('path');

const BENCHMARK_FILE = path.join(__dirname, '..', '..', 'benchmarks.json');

class Benchmark {
  save(repositoryUrl, metrics) {
    let history = [];
    
    // Read existing
    try {
      if (fs.existsSync(BENCHMARK_FILE)) {
        const data = fs.readFileSync(BENCHMARK_FILE, 'utf8');
        history = JSON.parse(data);
      }
    } catch (e) {
      console.warn("Could not read existing benchmarks, starting fresh.", e.message);
    }

    // Format the new entry
    const entry = {
      repository: repositoryUrl.replace('https://github.com/', ''),
      timestamp: new Date().toISOString(),
      scale: {
        filesScanned: metrics.filesScanned,
        nodes: metrics.nodes,
        edges: metrics.edges
      },
      quality: {
        circularDependencies: metrics.circular,
        heavyModules: metrics.heavy,
        deadFiles: metrics.dead,
        mostCoupledFile: metrics.mostCoupledFile,
        maxDependencyDepth: metrics.maxDependencyDepth
      },
      performance: {
        totalAnalysisTimeMs: metrics.totalTimeMs,
        scanTimeMs: metrics.scanTimeMs,
        graphTimeMs: metrics.graphTimeMs,
        impactQueryTimeMs: metrics.impactQueryTimeMs,
        memoryUsedMB: metrics.memoryUsedMB
      }
    };

    history.unshift(entry); // Add to beginning
    
    // Keep only last 50 benchmarks to prevent bloat
    if (history.length > 50) history = history.slice(0, 50);

    try {
      fs.writeFileSync(BENCHMARK_FILE, JSON.stringify(history, null, 2), 'utf8');
    } catch (e) {
      console.error("Failed to write benchmark file:", e);
    }
  }

  getHistory() {
    try {
      if (fs.existsSync(BENCHMARK_FILE)) {
        const data = fs.readFileSync(BENCHMARK_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Error reading benchmark history:", e);
    }
    return [];
  }
}

module.exports = new Benchmark();
