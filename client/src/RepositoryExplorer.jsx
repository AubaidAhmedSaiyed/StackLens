import React, { useState } from 'react';
import { FaFileCode, FaExclamationTriangle, FaRecycle, FaSearch } from 'react-icons/fa';

export default function RepositoryExplorer({ files, analysis, onSelectFile, selectedFile }) {
  const [filter, setFilter] = useState('');

  if (!files || files.length === 0) {
    return (
      <div className="ide-panel" style={{ gridArea: 'left', borderRight: '1px solid var(--border-color)' }}>
        <div className="ide-header">Explorer</div>
        <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
          No repository analyzed.
        </div>
      </div>
    );
  }

  const filteredFiles = files.filter(f => f.toLowerCase().includes(filter.toLowerCase()));
  
  // Create quick lookup sets for dead and circular files
  const deadSet = new Set(analysis?.dead || []);
  const circularSet = new Set(analysis?.circular || []);

  return (
    <div className="ide-panel" style={{ gridArea: 'left', borderRight: '1px solid var(--border-color)', height: '100%', overflow: 'hidden' }}>
      <div className="ide-header">EXPLORER</div>
      
      <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '8px', top: '8px', color: 'var(--text-muted)' }} />
          <input 
            className="ide-input"
            type="text"
            placeholder="Filter files..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ paddingLeft: '28px' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {filteredFiles.map((file, idx) => {
          const isSelected = selectedFile === file;
          const isDead = deadSet.has(file);
          const isCircular = circularSet.has(file);
          
          return (
            <div 
              key={idx}
              onClick={() => onSelectFile(file)}
              style={{
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                background: isSelected ? 'var(--bg-hover)' : 'transparent',
                borderLeft: isSelected ? '2px solid var(--border-active)' : '2px solid transparent',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: isDead ? 'var(--text-muted)' : 'var(--text-main)'
              }}
              onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
            >
              <FaFileCode color={isDead ? 'var(--text-muted)' : 'var(--text-code)'} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {file.split('/').pop()}
              </span>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                {isCircular && <FaRecycle color="var(--status-direct)" title="Circular Dependency" />}
                {isDead && <FaExclamationTriangle color="var(--status-indirect)" title="Dead Code (0 incoming imports)" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
