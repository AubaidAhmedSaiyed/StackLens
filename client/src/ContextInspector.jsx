import React, { useState } from 'react';
import { FaProjectDiagram, FaArrowRight, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

export default function ContextInspector({ selectedFile, impactData, onNavigate }) {
  const [activeTab, setActiveTab] = useState('impact'); // 'impact' or 'deps'

  if (!selectedFile) {
    return (
      <div className="ide-panel" style={{ gridArea: 'right', borderLeft: '1px solid var(--border-color)' }}>
        <div className="ide-header">INSPECTOR</div>
        <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', lineHeight: '1.5' }}>
          Select a file from the explorer or click a node on the canvas to inspect its architectural context.
        </div>
      </div>
    );
  }

  const directImpact = impactData?.directImpact || [];
  const indirectImpact = impactData?.indirectImpact || [];
  const forwardDependencies = impactData?.forwardDependencies || [];
  const summary = impactData?.impactSummary;

  return (
    <div className="ide-panel" style={{ gridArea: 'right', borderLeft: '1px solid var(--border-color)', height: '100%', overflow: 'hidden' }}>
      <div className="ide-header">INSPECTOR</div>
      
      {/* File Header Info */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-hover)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Target File</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', wordBreak: 'break-all', color: 'var(--border-active)', marginBottom: '12px' }}>
          {selectedFile}
        </div>
        
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
          <div><span style={{ color: 'var(--text-muted)' }}>In-Degree:</span> {directImpact.length}</div>
          <div><span style={{ color: 'var(--text-muted)' }}>Blast Radius:</span> {summary?.totalAffected || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          className="ide-button" 
          style={{ flex: 1, justifyContent: 'center', border: 'none', background: activeTab === 'impact' ? 'var(--bg-base)' : 'var(--bg-panel)', borderBottom: activeTab === 'impact' ? '2px solid var(--border-active)' : '2px solid transparent' }}
          onClick={() => setActiveTab('impact')}
        >
          Blast Radius
        </button>
        <button 
          className="ide-button" 
          style={{ flex: 1, justifyContent: 'center', border: 'none', borderLeft: '1px solid var(--border-color)', background: activeTab === 'deps' ? 'var(--bg-base)' : 'var(--bg-panel)', borderBottom: activeTab === 'deps' ? '2px solid var(--border-active)' : '2px solid transparent' }}
          onClick={() => setActiveTab('deps')}
        >
          Dependencies
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        
        {activeTab === 'impact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Architectural Summary */}
            {summary && summary.totalAffected > 0 && (
              <div style={{ padding: '12px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '2px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Architectural Summary
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-main)' }}>Impact Depth:</span> Propagates {summary.dependencyDepth} layers deep.
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--text-main)' }}>Affected Modules:</span> {summary.affectedModules.join(', ')}
                </div>
              </div>
            )}

            {directImpact.length === 0 && indirectImpact.length === 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <FaExclamationTriangle color="var(--status-indirect)" /> No files depend on this (Dead Code).
              </div>
            )}

            {directImpact.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--status-direct)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Directly Broken ({directImpact.length})
                </div>
                {directImpact.map((f, i) => (
                  <div key={i} onClick={() => onNavigate(f)} style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', padding: '4px 0', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <FaArrowRight color="var(--text-muted)" /> <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.split('/').pop()}</span>
                  </div>
                ))}
              </div>
            )}

            {indirectImpact.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--status-indirect)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Indirectly Broken ({indirectImpact.length})
                </div>
                {indirectImpact.map((f, i) => (
                  <div key={i} onClick={() => onNavigate(f)} style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', padding: '4px 0', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <FaArrowRight color="var(--text-muted)" /> <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.split('/').pop()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'deps' && (
          <div>
             <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.4' }}>
                Files that {selectedFile.split('/').pop()} imports to function.
             </div>
             {forwardDependencies.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No internal dependencies found.</div>
             ) : (
                forwardDependencies.map((f, i) => (
                  <div key={i} onClick={() => onNavigate(f)} style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', padding: '4px 0', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <FaArrowLeft color="var(--text-muted)" /> <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.split('/').pop()}</span>
                  </div>
                ))
             )}
          </div>
        )}

      </div>
    </div>
  );
}
