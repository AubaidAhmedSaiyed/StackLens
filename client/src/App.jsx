import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaSearch, FaLayerGroup } from 'react-icons/fa';

import GraphContainer from './GraphContainer';
import MetricsPanel from './MetricsPanel';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/expressjs/express');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [data, setData] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError(null);
    setData(null);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* Header Area */}
      <header className="glass-panel" style={{ 
        padding: '16px 32px', 
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--accent) 0%, #1e5ab8 100%)', 
            color: 'white', 
            width: '36px', 
            height: '36px', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--accent-glow)'
          }}>
            <FaLayerGroup size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text-main)', lineHeight: '1.2' }}>StackLens</h1>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: '600' }}>Codebase Intelligence</p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '12px', width: '550px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FaGithub style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)', fontSize: '16px' }} />
            <input 
              type="text" 
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'rgba(10, 12, 16, 0.5)',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.boxShadow = '0 0 0 2px var(--accent-glow), inset 0 2px 4px rgba(0,0,0,0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '0 24px',
              borderRadius: '8px',
              background: loading ? 'var(--bg-panel-hover)' : 'linear-gradient(135deg, var(--accent) 0%, #1e5ab8 100%)',
              color: loading ? 'var(--text-muted)' : 'white',
              border: '1px solid ' + (loading ? 'var(--border-color)' : 'transparent'),
              fontWeight: '600',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 12px var(--accent-glow)'
            }}
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{ width: '16px', height: '16px', border: '2px solid var(--text-muted)', borderTopColor: 'transparent', borderRadius: '50%' }}
              />
            ) : (
              <><FaSearch /> Analyze</>
            )}
          </button>
        </form>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                padding: '40px 60px',
                borderRadius: '16px',
                border: '1px solid rgba(47, 129, 247, 0.3)'
              }}
            >
               <motion.div 
                animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                transition={{ rotate: { repeat: Infinity, duration: 2, ease: "linear" }, scale: { repeat: Infinity, duration: 1.5 } }}
                style={{ 
                  width: '56px', height: '56px', 
                  border: '3px solid var(--accent)', 
                  borderTopColor: 'transparent', 
                  borderRadius: '50%',
                  filter: 'drop-shadow(0 0 8px var(--accent-glow))'
                }}
              />
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--text-main)', fontWeight: 600 }}>Analyzing Codebase</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>Fetching files, building ASTs, and resolving dependencies</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ padding: '30px 40px', borderRadius: '12px', border: '1px solid var(--danger)', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--danger)', fontSize: '18px', fontWeight: 600 }}>Analysis Failed</h3>
              <p style={{ color: 'var(--text-main)', marginTop: '8px', fontSize: '14px' }}>{error}</p>
            </div>
          </div>
        ) : (
          <>
            <GraphContainer graphData={data?.visual} reverseGraph={data?.reverseGraph} />
            
            <AnimatePresence>
              {data && (
                <MetricsPanel metrics={data.metrics} analysis={data.analysis} />
              )}
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}
