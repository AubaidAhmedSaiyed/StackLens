class RepoCache {
  constructor() {
    // Simple in-memory cache for a single active analysis (perfect for single-user dev/demo)
    this.graph = null;
    this.reverseGraph = null;
    this.metrics = null;
    this.files = [];
  }

  set(graph, reverseGraph, metrics, files) {
    this.graph = graph;
    this.reverseGraph = reverseGraph;
    this.metrics = metrics;
    this.files = files;
  }

  get() {
    return {
      graph: this.graph,
      reverseGraph: this.reverseGraph,
      metrics: this.metrics,
      files: this.files
    };
  }
}

// Export singleton
module.exports = new RepoCache();
