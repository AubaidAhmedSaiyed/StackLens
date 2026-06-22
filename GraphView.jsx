import React from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

function GraphView({ data }) {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <ReactFlow nodes={data.nodes} edges={data.edges} />
    </div>
  );
}

onNodeClick = async (node) => {
  const res = await fetch(`/impact?file=${node.id}`);
  const data = await res.json();

  highlightNodes(data.impacted);
};

onSearch = async (query) => {
  const res = await fetch(`/search?query=${query}`);
  const data = await res.json();

  highlightNodes(data.impactedBy);
};

export default GraphView;