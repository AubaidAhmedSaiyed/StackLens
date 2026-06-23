const { performance } = require('perf_hooks');

class MetricsCollector {
  constructor() {
    this.metrics = {
      filesScanned: 0,
      nodes: 0,
      edges: 0,
      circular: 0,
      heavy: 0,
      dead: 0,
      scanTimeMs: 0,
      graphTimeMs: 0,
      impactQueryTimeMs: 0,
      totalTimeMs: 0,
      memoryUsedMB: 0,
      mostCoupledFile: null,
      maxDependencyDepth: 0
    };
    
    // Performance timers
    this.startTime = performance.now();
    this.lapTime = performance.now();
    
    // Memory tracker
    this.startMemory = process.memoryUsage().heapUsed;
  }

  recordLap(metricName) {
    const now = performance.now();
    this.metrics[metricName] = Math.round(now - this.lapTime);
    this.lapTime = now;
  }

  recordCustomTime(metricName, durationMs) {
    this.metrics[metricName] = Math.round(durationMs);
  }

  end() {
    this.metrics.totalTimeMs = Math.round(performance.now() - this.startTime);
    
    const endMemory = process.memoryUsage().heapUsed;
    const usedBytes = endMemory - this.startMemory;
    this.metrics.memoryUsedMB = Math.round(Math.max(0, usedBytes) / 1024 / 1024);
    
    return this.metrics;
  }
}

module.exports = MetricsCollector;