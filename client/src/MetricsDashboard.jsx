import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaTimes, FaChartBar, FaDatabase, FaBolt, FaProjectDiagram } from 'react-icons/fa';

export default function MetricsDashboard({ onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/metrics/history');
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch metrics history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const MetricCard = ({ title, icon, value, unit, color }) => (
    <div style={{
      background: 'rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
        <span style={{ color }}>{icon}</span> {title}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>
        {value} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'normal' }}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel"
        style={{
          width: '850px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-panel-solid)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaChartBar color="var(--accent)" /> Real Metrics & Benchmarks
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <FaTimes size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading benchmarks...</div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No benchmarks recorded yet. Analyze a repository first!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {history.map((run, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px', 
                  padding: '20px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent)' }}>{run.repository}</h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(run.timestamp).toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <MetricCard title="Files Scanned" icon={<FaDatabase />} value={run.scale.filesScanned} color="var(--accent)" />
                    <MetricCard title="Graph Nodes" icon={<FaProjectDiagram />} value={run.scale.nodes} color="var(--accent)" />
                    <MetricCard title="Total Edges" icon={<FaProjectDiagram />} value={run.scale.edges} color="var(--accent)" />
                    <MetricCard title="Most Coupled" icon={<FaProjectDiagram />} value={run.quality.maxDependencies} unit="deps" color="var(--danger)" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <MetricCard title="Total Time" icon={<FaBolt />} value={run.performance.totalAnalysisTimeMs} unit="ms" color="var(--success)" />
                    <MetricCard title="Impact Query" icon={<FaBolt />} value={run.performance.impactQueryTimeMs} unit="ms" color="var(--warning)" />
                    <MetricCard title="Memory Used" icon={<FaDatabase />} value={run.performance.memoryUsedMB} unit="MB" color="var(--warning)" />
                    <MetricCard title="Dead Files" icon={<FaDatabase />} value={run.quality.deadFiles} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
