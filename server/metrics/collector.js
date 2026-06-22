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
      totalTimeMs: 0
    };
    this.startTime = Date.now();
    this.lapTime = Date.now();
  }

  recordLap(metricName) {
    const now = Date.now();
    this.metrics[metricName] = now - this.lapTime;
    this.lapTime = now;
  }

  end() {
    this.metrics.totalTimeMs = Date.now() - this.startTime;
    return this.metrics;
  }
}

module.exports = MetricsCollector;