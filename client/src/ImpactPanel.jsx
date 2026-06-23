import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaProjectDiagram, FaExclamationTriangle, FaInfoCircle, FaLink } from 'react-icons/fa';

export default function ImpactPanel({ impactData, onSelectFile }) {
  if (!impactData) {
    return (
      <div className="glass-panel" style={{ 
        width: '340px', 
        borderLeft: '1px solid var(--border-color)',
        borderRight: 'none', borderTop: 'none', borderBottom: 'none',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-panel-solid)',
        zIndex: 10
      }}>
        <FaProjectDiagram size={48} color="var(--border-color)" style={{ marginBottom: '20px' }} />
        <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '10px' }}>Select a File</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          Click any node to:
          <br/>• View dependency relationships
          <br/>• Explore affected files
          <br/>• Trace dependency chains
          <br/>• Understand project impact
        </p>
      </div>
    );
  }

  const { selectedFile, directImpact, indirectImpact, impactSummary, repositoryContext } = impactData;

  const renderFileList = (files, emptyText) => {
    if (files.length === 0) return <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{emptyText}</div>;
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {files.map(f => (
          <li 
            key={f}
            onClick={() => onSelectFile(f)}
            style={{ 
              fontSize: '13px', 
              color: 'var(--text-main)', 
              cursor: 'pointer',
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            <FaLink size={10} color="var(--text-muted)" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.split('/').pop()}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-panel" 
      style={{ 
        width: '340px', 
        borderLeft: '1px solid var(--border-color)',
        borderRight: 'none', borderTop: 'none', borderBottom: 'none',
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-panel-solid)',
        zIndex: 10,
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'rgba(47, 129, 247, 0.05)' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>Impact Analysis</div>
        <h2 style={{ fontSize: '16px', fontWeight: 600, wordBreak: 'break-all', lineHeight: 1.3 }}>{selectedFile.split('/').pop()}</h2>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', wordBreak: 'break-all' }}>{selectedFile}</div>
      </div>

      {/* Impact Summary */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaInfoCircle color="var(--accent)" /> Impact Summary
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger)' }}>{impactSummary.totalAffected}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Total Affected</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)' }}>{impactSummary.dependencyDepth}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Max Depth</div>
          </div>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Directly Dependent:</span>
            <strong>{impactSummary.directCount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Indirectly Dependent:</span>
            <strong>{impactSummary.indirectCount}</strong>
          </div>
          
          {impactSummary.affectedModules && impactSummary.affectedModules.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '12px' }}>Affected Modules:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {impactSummary.affectedModules.map(mod => (
                  <span key={mod} style={{ 
                    background: 'rgba(47, 129, 247, 0.1)', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '11px', 
                    border: '1px solid rgba(47, 129, 247, 0.3)', 
                    color: 'var(--accent)' 
                  }}>
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Affected Files */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaExclamationTriangle color="var(--warning)" /> Affected Files
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--warning)', marginBottom: '8px', textTransform: 'uppercase' }}>Direct Impact (Orange)</div>
          {renderFileList(directImpact, "No direct dependencies.")}
        </div>

        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--danger)', marginBottom: '8px', textTransform: 'uppercase' }}>Indirect Impact (Red)</div>
          {renderFileList(indirectImpact, "No indirect dependencies.")}
        </div>

        {/* Dependency Chains */}
        {impactData.chainEdges && impactData.chainEdges.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaProjectDiagram color="var(--text-muted)" /> Dependency Paths
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {(() => {
                const adj = {};
                impactData.chainEdges.forEach(e => {
                  if (!adj[e.source]) adj[e.source] = [];
                  adj[e.source].push(e.target);
                });

                const paths = [];
                const dfs = (current, currentPath) => {
                  if (!adj[current] || adj[current].length === 0) {
                    if (currentPath.length > 1) paths.push([...currentPath]);
                    return;
                  }
                  adj[current].forEach(neighbor => {
                    if (!currentPath.includes(neighbor)) {
                      dfs(neighbor, [...currentPath, neighbor]);
                    } else {
                      paths.push([...currentPath, neighbor + ' (cycle)']);
                    }
                  });
                };
                
                dfs(selectedFile, [selectedFile]);

                // Limit to 20 paths to prevent UI lag on massive chains
                return paths.slice(0, 20).map((path, idx) => (
                  <div key={idx} style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-main)', 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    border: '1px solid rgba(255,255,255,0.05)' 
                  }}>
                    {path.map((node, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ 
                          fontWeight: i === 0 ? 600 : 400,
                          color: i === 0 ? 'var(--accent)' : i === 1 ? 'var(--warning)' : 'var(--danger)' 
                        }}>
                          {node.split('/').pop()}
                        </span>
                        {i < path.length - 1 && (
                          <span style={{ color: 'var(--text-muted)', margin: '4px 0 4px 6px', fontSize: '10px' }}>
                            ↓
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Mini Statistics */}
      {repositoryContext && (
        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.1)', flex: 1 }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-muted)' }}>
            Repository Context
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Files Scanned:</span>
              <span style={{ color: 'var(--text-main)' }}>{repositoryContext.filesScanned}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Graph Nodes:</span>
              <span style={{ color: 'var(--text-main)' }}>{repositoryContext.nodes}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Dependencies:</span>
              <span style={{ color: 'var(--text-main)' }}>{repositoryContext.edges}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Circular Dependencies:</span>
              <span style={{ color: repositoryContext.circular > 0 ? 'var(--danger)' : 'var(--success)' }}>{repositoryContext.circular}</span>
            </div>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Heavy Modules:</span>
              <span style={{ color: repositoryContext.heavy > 0 ? 'var(--warning)' : 'var(--text-main)' }}>{repositoryContext.heavy}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Dead Files:</span>
              <span style={{ color: 'var(--text-main)' }}>{repositoryContext.dead}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
