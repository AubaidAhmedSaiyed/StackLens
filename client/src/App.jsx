import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaSearch } from 'react-icons/fa';

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      
      {/* Header Area */}
      <header style={{ 
        padding: '16px 24px', 
        background: 'var(--bg-panel)', 
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: 'var(--accent)', 
            color: 'white', 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>S</div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>StackLens</h1>
        </div>

        <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '8px', width: '500px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FaGithub style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              style={{
                width: '100%',
                padding: '10px 10px 10px 36px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-dark)',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '0 20px',
              borderRadius: '6px',
              background: loading ? 'var(--bg-panel-hover)' : 'var(--accent)',
              color: 'white',
              border: 'none',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
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
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 17, 21, 0.8)',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px'
              }}
            >
               <motion.div 
                animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
                transition={{ rotate: { repeat: Infinity, duration: 2, ease: "linear" }, scale: { repeat: Infinity, duration: 1 } }}
                style={{ width: '48px', height: '48px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }}
              />
              <h2 style={{ fontSize: '18px', color: 'var(--text-main)' }}>Analyzing Codebase...</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Fetching files, building ASTs, and resolving dependencies</p>
            </motion.div>
          )}
        </AnimatePresence>

        {error ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
            <h3>{error}</h3>
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
