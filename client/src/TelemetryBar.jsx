import React from 'react';
import { FaTerminal, FaHdd, FaProjectDiagram, FaClock } from 'react-icons/fa';

export default function TelemetryBar({ repoUrl, metrics }) {
  if (!metrics) return null;

  const repoName = repoUrl.replace('https://github.com/', '').toUpperCase();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '28px',
      background: 'var(--bg-active)',
      color: '#fff',
      padding: '0 12px',
      fontSize: '11px',
      fontFamily: 'var(--font-mono)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaTerminal /> {repoName || 'NO_TARGET'}
        </div>
        <div style={{ display: 'flex', gap: '16px', opacity: 0.9 }}>
          <span>FILES: {metrics.filesScanned || 0}</span>
          <span>NODES: {metrics.nodes || 0}</span>
          <span>EDGES: {metrics.edges || 0}</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', opacity: 0.9 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FaClock /> {(metrics.totalTimeMs / 1000).toFixed(2)}s
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FaHdd /> {metrics.memoryUsedMB || 0}MB
        </span>
      </div>
    </div>
  );
}
