import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { FaFileCode } from 'react-icons/fa';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  // Spread nodes out more for a flowchart feel without zooming
  dagreGraph.setGraph({ rankdir: direction, ranksep: 200, nodesep: 60 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 60 });
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
        x: nodeWithPosition.x - 90, 
        y: nodeWithPosition.y - 25, 
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const ArchitectureNode = ({ data, targetPosition, sourcePosition }) => {
  return (
    <div className="custom-node">
      <Handle type="target" position={targetPosition} style={{ background: 'var(--border-color)', width: '6px', height: '6px', border: 'none' }} />
      <div className="node-icon">
        <FaFileCode size={12} />
      </div>
      <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={data.label}>
        {data.label}
      </div>
      <Handle type="source" position={sourcePosition} style={{ background: 'var(--accent)', width: '6px', height: '6px', border: 'none' }} />
    </div>
  );
};

const nodeTypes = {
  architecture: ArchitectureNode,
};

function GraphInner({ graphData, selectedFile, impactData, onNodeClick }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, setCenter } = useReactFlow();

  // 1. Initialize Graph
  useEffect(() => {
    if (!graphData) return;

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
      type: 'smoothstep', // Square routing
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--border-color)' },
      className: ''
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges, 'LR');

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    // Slight delay to ensure React Flow is ready before fitting view
    setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 50);

  }, [graphData, setNodes, setEdges, fitView]);

  // 2. Apply Impact Styles and Center Node
  useEffect(() => {
    if (!graphData) return;

    if (!selectedFile) {
      // Reset styles
      setNodes(nds => nds.map(n => ({ ...n, className: '' })));
      setEdges(eds => eds.map(e => ({ 
        ...e, 
        className: '', 
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--border-color)' }
      })));
      return;
    }

    // Determine impact sets
    const directSet = new Set(impactData?.directImpact || []);
    const indirectSet = new Set(impactData?.indirectImpact || []);
    
    // We need to know which edges to highlight
    // Impact chain edges from the backend:
    const chainEdges = impactData?.chainEdges || [];
    const chainEdgeIds = new Set(chainEdges.map(e => `${e.source}->${e.target}`));

    setNodes(nds => nds.map(n => {
      if (n.id === selectedFile) n.className = 'selected-node';
      else if (directSet.has(n.id)) n.className = 'impact-direct';
      else if (indirectSet.has(n.id)) n.className = 'impact-indirect';
      else n.className = 'unrelated';
      return n;
    }));

    setEdges(eds => eds.map(e => {
      // An edge is highlighted if it's in the chain, OR if its source is the selected file (direct impact)
      if (e.source === selectedFile) {
        e.className = 'impact-direct';
        e.animated = true;
        e.markerEnd = { type: MarkerType.ArrowClosed, color: 'var(--warning)' };
      } else if (chainEdgeIds.has(e.id) || (directSet.has(e.source) && indirectSet.has(e.target)) || (indirectSet.has(e.source) && indirectSet.has(e.target))) {
        e.className = 'impact-indirect';
        e.animated = true;
        e.markerEnd = { type: MarkerType.ArrowClosed, color: 'var(--danger)' };
      } else {
        e.className = 'unrelated';
        e.animated = false;
        e.markerEnd = { type: MarkerType.ArrowClosed, color: 'var(--border-color)' };
      }
      return e;
    }));

    // Center the graph on the selected node
    const selectedNode = nodes.find(n => n.id === selectedFile);
    if (selectedNode) {
      setCenter(selectedNode.position.x + 90, selectedNode.position.y + 25, { zoom: 1.2, duration: 800 });
    }

  }, [selectedFile, impactData, graphData, setNodes, setEdges, setCenter]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(_, node) => onNodeClick(node.id)}
      onPaneClick={() => onNodeClick(null)}
      colorMode="dark"
      minZoom={0.05}
      maxZoom={4}
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
        nodeColor={(n) => {
          if (n.className.includes('selected-node')) return 'var(--accent)';
          if (n.className.includes('impact-direct')) return 'var(--warning)';
          if (n.className.includes('impact-indirect')) return 'var(--danger)';
          return 'rgba(48, 54, 61, 0.5)';
        }}
        maskColor="rgba(10, 12, 16, 0.8)"
        style={{ 
          backgroundColor: 'var(--bg-panel-solid)', 
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
    </ReactFlow>
  );
}

export default function GraphContainer(props) {
  if (!props.graphData) {
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
      <ReactFlowProvider>
        <GraphInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}
