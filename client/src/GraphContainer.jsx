import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { FaFileCode } from 'react-icons/fa';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// 1. Layout logic using Dagre
const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    // estimated node width and height
    dagreGraph.setNode(node.id, { width: 180, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - 90, // adjust by half width
        y: nodeWithPosition.y - 25, // adjust by half height
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// 2. Custom Node Component
const ArchitectureNode = ({ data, targetPosition, sourcePosition }) => {
  return (
    <div className="custom-node">
      <Handle type="target" position={targetPosition} style={{ background: 'var(--border-color)', width: '6px', height: '6px' }} />
      <div className="node-icon">
        <FaFileCode size={12} />
      </div>
      <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={data.label}>
        {data.label}
      </div>
      <Handle type="source" position={sourcePosition} style={{ background: 'var(--accent)', width: '6px', height: '6px' }} />
    </div>
  );
};

const nodeTypes = {
  architecture: ArchitectureNode,
};

export default function GraphContainer({ graphData, reverseGraph }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [impactedNodes, setImpactedNodes] = useState(new Set());

  // Initialize graph
  useEffect(() => {
    if (!graphData) return;

    // Convert StackLens visual format to React Flow format
    const initialNodes = graphData.nodes.map(n => ({
      id: n.id,
      type: 'architecture',
      data: { label: n.id.split('/').pop() || n.id },
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
      className: ''
    }));

    // Apply Dagre Layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges, 'LR');

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setImpactedNodes(new Set());
  }, [graphData, setNodes, setEdges]);

  // Handle impact analysis on node click
  const onNodeClick = useCallback((event, node) => {
    if (!reverseGraph) return;

    // Simple BFS to find all impacted files (downstream dependants)
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
          n.className = 'impacted source';
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
          e.className = 'impacted';
          e.animated = true;
          e.style = { stroke: 'var(--danger)' };
          e.markerEnd = { type: MarkerType.ArrowClosed, color: 'var(--danger)' };
        } else {
          e.className = '';
          e.animated = true;
          e.style = {};
          e.markerEnd = { type: MarkerType.ArrowClosed, color: 'var(--border-color)' };
        }
        return e;
      })
    );

  }, [reverseGraph, setNodes, setEdges]);

  // Click on pane to reset
  const onPaneClick = useCallback(() => {
    setImpactedNodes(new Set());
    setNodes((nds) => nds.map((n) => ({ ...n, className: '' })));
    setEdges((eds) => eds.map((e) => ({ 
      ...e, 
      className: '', 
      style: {},
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--border-color)' } 
    })));
  }, [setNodes, setEdges]);

  if (!graphData) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center', opacity: 0.6 }}>
          <FaFileCode size={48} style={{ marginBottom: '16px', color: 'var(--border-color)' }}/>
          <h2 style={{ fontWeight: 500 }}>No Architecture Loaded</h2>
          <p style={{ marginTop: '8px' }}>Enter a GitHub repository URL above to generate the dependency tree.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      {impactedNodes.size > 0 && (
        <div style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 10,
          background: 'var(--bg-panel-solid)',
          border: '1px solid var(--danger)',
          color: 'var(--text-main)',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 8px 24px rgba(248, 81, 73, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 8px var(--danger)' }} />
          <span>Impact Analysis: <strong>{impactedNodes.size}</strong> files affected</span>
        </div>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        colorMode="dark"
        minZoom={0.1}
      >
        <Background color="var(--border-color)" gap={20} size={1} />
        <Controls 
          style={{ 
            fill: 'var(--text-main)', 
            backgroundColor: 'var(--bg-panel-solid)', 
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            borderRadius: '8px',
            overflow: 'hidden'
          }} 
        />
        <MiniMap 
          nodeColor={(n) => n.className.includes('impacted') ? 'var(--danger)' : 'var(--accent)'}
          maskColor="rgba(10, 12, 16, 0.8)"
          style={{ 
            backgroundColor: 'var(--bg-panel-solid)', 
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />
      </ReactFlow>
    </div>
  );
}
