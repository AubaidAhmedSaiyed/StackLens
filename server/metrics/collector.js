const { performance } = require('perf_hooks');

class MetricsCollector {
  constructor() {
    this.metrics = {
      isColdRun: false,
      filesScanned: 0,
      nodes: 0,
      edges: 0,
      stages: {}, // stores { start, end, durationMs }
      memory: {
        peakHeapMB: 0,
        averageHeapMB: 0,
        finalHeapMB: 0,
        rssMB: 0,
        externalMB: 0
      }
    };
    
    this.startTime = performance.now();
    this.memorySamples = [];
    
    this.pollInterval = setInterval(() => this.pollMemory(), 10);
    this.pollMemory();
  }

  pollMemory() {
    const mem = process.memoryUsage();
    this.memorySamples.push(mem.heapUsed);
    this.metrics.memory.peakHeapMB = Math.max(this.metrics.memory.peakHeapMB, mem.heapUsed);
    this.metrics.memory.rssMB = Math.max(this.metrics.memory.rssMB, mem.rss);
    this.metrics.memory.externalMB = Math.max(this.metrics.memory.externalMB, mem.external);
  }

  recordStage(stageName, start, end) {
    this.metrics.stages[stageName] = {
      start: start,
      end: end,
      durationMs: Math.round(end - start)
    };
  }

  end() {
    clearInterval(this.pollInterval);
    this.pollMemory();
    
    const endMs = performance.now();
    this.recordStage('totalAnalysis', this.startTime, endMs);
    
    // Memory math
    const sumHeap = this.memorySamples.reduce((a, b) => a + b, 0);
    const avgHeap = sumHeap / this.memorySamples.length;
    const finalHeap = process.memoryUsage().heapUsed;
    
    this.metrics.memory.averageHeapMB = Math.round(avgHeap / 1024 / 1024);
    this.metrics.memory.finalHeapMB = Math.round(finalHeap / 1024 / 1024);
    this.metrics.memory.peakHeapMB = Math.round(this.metrics.memory.peakHeapMB / 1024 / 1024);
    this.metrics.memory.rssMB = Math.round(this.metrics.memory.rssMB / 1024 / 1024);
    this.metrics.memory.externalMB = Math.round(this.metrics.memory.externalMB / 1024 / 1024);
    
    return this.metrics;
  }
}

module.exports = MetricsCollector;