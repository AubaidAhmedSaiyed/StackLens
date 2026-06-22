import React from 'react';
import { motion } from 'framer-motion';
import { FaChartPie, FaExclamationTriangle, FaCheckCircle, FaProjectDiagram } from 'react-icons/fa';

export default function MetricsPanel({ metrics, analysis }) {
  if (!metrics || !analysis) return null;

  return (
    <motion.div 
      initial={{ x: 350, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 350, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="glass-panel"
      style={{
        width: '340px',
        borderLeft: '1px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        height: '100%',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaChartPie style={{ color: 'var(--accent)', fontSize: '18px' }} />
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)' }}>Architecture Insights</h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <StatBox label="Files Scanned" value={metrics.filesScanned} />
        <StatBox label="Nodes" value={metrics.nodes} />
        <StatBox label="Edges" value={metrics.edges} />
        <StatBox label="Analysis Time" value={`${metrics.totalTimeMs}ms`} />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', marginTop: '8px' }}>
          <FaProjectDiagram style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
          <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Code Health</h3>
        </div>
        
        <AlertBox type="danger" count={metrics.circular} label="Circular Dependencies" />
        <AlertBox type="warning" count={metrics.heavy} label="Heavy Modules" />
        <AlertBox type="success" count={metrics.dead} label="Dead Files" />
      </div>

      {analysis.impactSample && (
        <div style={{ 
          marginTop: 'auto', 
          padding: '16px', 
          background: 'rgba(10, 12, 16, 0.4)', 
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Sample Impact Analysis</h4>
          <p style={{ fontSize: '13px', wordBreak: 'break-all', color: 'var(--text-main)', lineHeight: 1.4 }}>
            File: <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{analysis.impactSample.file}</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
            <FaExclamationTriangle style={{ color: 'var(--danger)' }} />
            <p style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 500 }}>
              Impacts {analysis.impactSample.impacted?.length || 0} downstream files
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ 
      background: 'rgba(10, 12, 16, 0.4)', 
      padding: '16px', 
      borderRadius: '10px', 
      border: '1px solid var(--border-color)',
      transition: 'all 0.2s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--border-highlight)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--border-color)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)', letterSpacing: '-0.5px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function AlertBox({ type, count, label }) {
  const color = `var(--${type})`;
  const glow = `var(--${type}-glow)`;
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '14px 16px',
      background: 'rgba(10, 12, 16, 0.4)',
      borderLeft: `4px solid ${color}`,
      borderRadius: '8px',
      marginBottom: '10px',
      borderTop: '1px solid var(--border-color)',
      borderRight: '1px solid var(--border-color)',
      borderBottom: '1px solid var(--border-color)',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = `linear-gradient(90deg, ${glow} 0%, rgba(10, 12, 16, 0.4) 100%)`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(10, 12, 16, 0.4)';
    }}
    >
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>{label}</span>
      <span style={{ fontWeight: '700', color, fontSize: '15px' }}>{count}</span>
    </div>
  );
}
