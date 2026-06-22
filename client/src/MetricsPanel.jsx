import React from 'react';
import { motion } from 'framer-motion';

export default function MetricsPanel({ metrics, analysis }) {
  if (!metrics || !analysis) return null;

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="metrics-sidebar"
      style={{
        width: '320px',
        background: 'var(--bg-panel)',
        borderLeft: '1px solid var(--border-color)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Architecture Insights</h2>
      
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <StatBox label="Files Scanned" value={metrics.filesScanned} />
        <StatBox label="Nodes" value={metrics.nodes} />
        <StatBox label="Edges" value={metrics.edges} />
        <StatBox label="Total Time" value={`${metrics.totalTimeMs}ms`} />
      </div>

      <div className="insight-section">
        <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '10px', marginTop: '10px' }}>Code Health</h3>
        
        <AlertBox type="danger" count={metrics.circular} label="Circular Dependencies" />
        <AlertBox type="warning" count={metrics.heavy} label="Heavy Modules" />
        <AlertBox type="success" count={metrics.dead} label="Dead Files" />
      </div>

      {analysis.impactSample && (
        <div className="impact-sample" style={{ marginTop: 'auto', padding: '15px', background: 'var(--bg-dark)', borderRadius: '8px' }}>
          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Sample Impact Analysis</h4>
          <p style={{ fontSize: '12px', wordBreak: 'break-all' }}>File: {analysis.impactSample.file}</p>
          <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
            Impacts {analysis.impactSample.impacted?.length || 0} downstream files
          </p>
        </div>
      )}
    </motion.div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

function AlertBox({ type, count, label }) {
  const color = `var(--${type})`;
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '12px',
      background: 'var(--bg-dark)',
      borderLeft: `3px solid ${color}`,
      borderRadius: '4px',
      marginBottom: '8px'
    }}>
      <span style={{ fontSize: '13px' }}>{label}</span>
      <span style={{ fontWeight: 'bold', color }}>{count}</span>
    </div>
  );
}
