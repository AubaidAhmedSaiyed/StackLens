import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function GraphContainer({ graphData, reverseGraph }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [impactedNodes, setImpactedNodes] = useState(new Set());

  // Initialize graph
  React.useEffect(() => {
    if (!graphData) return;

    // Convert StackLens visual format to React Flow format
    const initialNodes = graphData.nodes.map(n => ({
      id: n.id,
      position: n.position || { x: Math.random() * 800, y: Math.random() * 600 },
      data: { label: n.id.split('/').pop() || n.id },
      style: { width: 'auto' },
      className: ''
    }));

    const initialEdges = graphData.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--border-color)',
      },
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
    setImpactedNodes(new Set());
  }, [graphData, setNodes, setEdges]);

  // Handle impact analysis on node click
  const onNodeClick = useCallback((event, node) => {
    if (!reverseGraph) return;

    // Simple BFS to find all impacted files
    const impacted = new Set();
    const queue = [node.id];
    
    while(queue.length > 0) {
      const current = queue.shift();
      const dependants = reverseGraph[current] || [];
      for (const dep of dependants) {
        if (!impacted.has(dep)) {
          impacted.add(dep);
          queue.push(dep);
        }
      }
    }

    setImpactedNodes(impacted);

    // Highlight nodes and edges
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          n.className = 'impacted';
        } else if (impacted.has(n.id)) {
          n.className = 'impacted';
        } else {
          n.className = '';
        }
        return n;
      })
    );

    setEdges((eds) => 
      eds.map((e) => {
        if (e.source === node.id || impacted.has(e.source)) {
          e.className = 'selected';
        } else {
          e.className = '';
        }
        return e;
      })
    );

  }, [reverseGraph, setNodes, setEdges]);

  // Click on pane to reset
  const onPaneClick = useCallback(() => {
    setImpactedNodes(new Set());
    setNodes((nds) => nds.map((n) => ({ ...n, className: '' })));
    setEdges((eds) => eds.map((e) => ({ ...e, className: '' })));
  }, [setNodes, setEdges]);

  if (!graphData) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>Enter a GitHub repository URL above to generate the architecture graph.</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      {impactedNodes.size > 0 && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
          background: 'var(--danger)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(248, 81, 73, 0.3)'
        }}>
          Impact Analysis: {impactedNodes.size} files affected
        </div>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        colorMode="dark"
      >
        <Background color="var(--border-color)" gap={16} />
        <Controls style={{ fill: 'var(--text-main)', backgroundColor: 'var(--bg-panel)' }} />
        <MiniMap 
          nodeColor={(n) => {
            if (n.className === 'impacted') return 'var(--danger)';
            return 'var(--bg-panel-hover)';
          }}
          maskColor="rgba(15, 17, 21, 0.7)"
          style={{ backgroundColor: 'var(--bg-dark)' }}
        />
      </ReactFlow>
    </div>
  );
}
