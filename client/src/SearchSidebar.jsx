import React, { useState } from 'react';
import { FaSearch, FaCode } from 'react-icons/fa';

export default function SearchSidebar({ files, onSelectFile, selectedFile }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!files || files.length === 0) {
    return (
      <div className="glass-panel" style={{ width: '280px', borderRight: '1px solid var(--border-color)', borderLeft: 'none', borderTop: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
          No repository loaded.
        </div>
      </div>
    );
  }

  const filteredFiles = files.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="glass-panel" style={{ 
      width: '280px', 
      borderRight: '1px solid var(--border-color)', 
      borderLeft: 'none', borderTop: 'none', borderBottom: 'none',
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-panel-solid)',
      zIndex: 10
    }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)', fontSize: '12px' }} />
          <input 
            type="text" 
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'rgba(10, 12, 16, 0.5)',
              color: 'var(--text-main)',
              fontSize: '13px',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {filteredFiles.map(file => (
          <div 
            key={file}
            onClick={() => onSelectFile(file)}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: selectedFile === file ? 'rgba(47, 129, 247, 0.15)' : 'transparent',
              borderLeft: `3px solid ${selectedFile === file ? 'var(--accent)' : 'transparent'}`,
              color: selectedFile === file ? 'var(--text-main)' : 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (selectedFile !== file) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseOut={(e) => {
              if (selectedFile !== file) e.currentTarget.style.background = 'transparent';
            }}
          >
            <FaCode size={14} color={selectedFile === file ? 'var(--accent)' : 'var(--text-muted)'} />
            <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {file.split('/').pop()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
