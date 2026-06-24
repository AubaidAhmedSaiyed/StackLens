import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle
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
  const reactFlowInstance = React.useRef(null);

  // 1. Initialize Graph
  useEffect(() => {
    if (!graphData) return;

    const initialNodes = graphData.nodes.map(n => ({
      id: n.id,
      type: 'architecture',
      data: { label: n.id.split('/').pop() || n.id },
      className: ''
    }));

    const initialEdges = graphData.edges.map((e, index) => ({
      id: `${e.id}-${index}`,
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
      if (reactFlowInstance.current) {
        reactFlowInstance.current.fitView({ padding: 0.2 });
      }
    }, 50);

  }, [graphData, setNodes, setEdges]);

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
      const newNode = { ...n };
      if (newNode.id === selectedFile) newNode.className = 'selected-node';
      else if (directSet.has(newNode.id)) newNode.className = 'impact-direct';
      else if (indirectSet.has(newNode.id)) newNode.className = 'impact-indirect';
      else newNode.className = 'unrelated';
      return newNode;
    }));

    setEdges(eds => eds.map(e => {
      const newEdge = { ...e };
      // An edge is highlighted if it's in the chain, OR if its source is the selected file (direct impact)
      if (newEdge.source === selectedFile) {
        newEdge.className = 'impact-direct';
        newEdge.animated = true;
        newEdge.markerEnd = { type: MarkerType.ArrowClosed, color: 'var(--status-direct)' };
      } else if (chainEdgeIds.has(newEdge.id) || (directSet.has(newEdge.source) && indirectSet.has(newEdge.target)) || (indirectSet.has(newEdge.source) && indirectSet.has(newEdge.target))) {
        newEdge.className = 'impact-indirect';
        newEdge.animated = true;
        newEdge.markerEnd = { type: MarkerType.ArrowClosed, color: 'var(--status-indirect)' };
      } else {
        newEdge.className = 'unrelated';
        newEdge.animated = false;
        newEdge.markerEnd = { type: MarkerType.ArrowClosed, color: 'var(--border-color)' };
      }
      return newEdge;
    }));

    // Center the graph on the selected node
    // We get the position from the layouted reactFlowInstance to avoid depending on 'nodes' state in this effect
    if (reactFlowInstance.current) {
      const selectedNode = reactFlowInstance.current.getNode(selectedFile);
      if (selectedNode) {
        reactFlowInstance.current.setCenter(selectedNode.position.x + 90, selectedNode.position.y + 25, { zoom: 1.2, duration: 800 });
      }
    }

  }, [selectedFile, impactData, graphData, setNodes, setEdges]);

  return (
    <div style={{ gridArea: 'center', position: 'relative', width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        onPaneClick={() => onNodeClick(null)}
        onInit={(instance) => { reactFlowInstance.current = instance; }}
        colorMode="dark"
        minZoom={0.1}
        maxZoom={1.5}
        fitView
        attributionPosition="bottom-right"
      >
        <Background variant="dots" gap={16} size={1} color="var(--border-color)" style={{ backgroundColor: 'var(--bg-base)' }} />
        <Controls 
          style={{ 
            backgroundColor: 'var(--bg-panel)', 
            border: '1px solid var(--border-color)',
            boxShadow: 'none',
            borderRadius: '2px'
          }} 
        />
        <MiniMap 
          nodeColor={(n) => {
            if (n.className?.includes('impact-direct')) return 'var(--status-direct)';
            if (n.className?.includes('impact-indirect')) return 'var(--status-indirect)';
            if (n.className?.includes('selected-node')) return 'var(--border-active)';
            return 'var(--border-color)';
          }}
          maskColor="rgba(13, 17, 23, 0.7)"
          style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '2px' }}
        />
      </ReactFlow>
    </div>
  );
}

export default function GraphContainer(props) {
  if (!props.graphData) {
    return (
      <div style={{ gridArea: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center', opacity: 0.6 }}>
          <FaFileCode size={48} style={{ marginBottom: '16px', color: 'var(--border-color)' }}/>
          <h2 style={{ fontWeight: 500 }}>No Architecture Loaded</h2>
          <p style={{ marginTop: '8px' }}>Enter a GitHub repository URL above to generate the dependency tree.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ gridArea: 'center', position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <GraphInner {...props} />
    </div>
  );
}
