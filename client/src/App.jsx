import React, { useState } from 'react';
import axios from 'axios';
import { FaGithub, FaPlay, FaCircleNotch } from 'react-icons/fa';

import TelemetryBar from './TelemetryBar';
import RepositoryExplorer from './RepositoryExplorer';
import GraphContainer from './GraphContainer';
import ContextInspector from './ContextInspector';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/expressjs/express');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [data, setData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [impactData, setImpactData] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError(null);
    setData(null);
    setSelectedFile(null);
    setImpactData(null);

    try {
      const response = await axios.post('http://localhost:5000/api/analyze', { url: repoUrl });
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to analyze repository');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file) => {
    if (!file) {
      setSelectedFile(null);
      setImpactData(null);
      return;
    }

    setSelectedFile(file);
    try {
      const response = await axios.get(`http://localhost:5000/api/impact?file=${encodeURIComponent(file)}`);
      setImpactData(response.data);
    } catch (err) {
      console.error("Failed to fetch impact data:", err);
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '300px 1fr 350px', 
      gridTemplateRows: 'auto auto 1fr',
      gridTemplateAreas: `
        "top top top"
        "tool tool tool"
        "left center right"
      `,
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden',
      background: 'var(--bg-base)'
    }}>
      
      {/* Row 1: Telemetry Status Bar */}
      <div style={{ gridArea: 'top' }}>
        <TelemetryBar repoUrl={repoUrl} metrics={data?.metrics} />
      </div>

      {/* Row 2: Tool Bar (Input) */}
      <div style={{ 
        gridArea: 'tool', 
        borderBottom: '1px solid var(--border-color)', 
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: 'var(--bg-panel)'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
          STACKLENS <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>// STATIC ANALYSIS</span>
        </div>
        
        <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-base)', border: '1px solid var(--border-color)', flex: 1, padding: '0 8px' }}>
            <FaGithub color="var(--text-muted)" size={12} />
            <input 
              type="text" 
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              style={{
                width: '100%',
                padding: '6px 8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="ide-button"
            style={{ borderColor: loading ? 'var(--border-color)' : 'var(--border-active)', color: loading ? 'var(--text-muted)' : 'var(--border-active)' }}
          >
            {loading ? <FaCircleNotch className="spinner" /> : <FaPlay />} 
            {loading ? 'ANALYZING...' : 'RUN'}
          </button>
        </form>
      </div>

      {/* Row 3: Main Layout */}
      {error ? (
        <div style={{ gridColumn: '1 / -1', padding: '40px', color: 'var(--status-indirect)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          Error: {error}
        </div>
      ) : (
        <>
          <RepositoryExplorer 
            files={data?.files} 
            analysis={data?.analysis}
            onSelectFile={handleFileSelect} 
            selectedFile={selectedFile} 
          />
          
          <GraphContainer 
            graphData={data?.visual} 
            selectedFile={selectedFile}
            impactData={impactData}
            onNodeClick={handleFileSelect} 
          />
          
          <ContextInspector 
            selectedFile={selectedFile}
            impactData={impactData} 
            onNavigate={handleFileSelect}
          />
        </>
      )}
      
      {/* Simple spinner keyframe injection for the RUN button */}
      <style>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
