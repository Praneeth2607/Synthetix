"use client";

import React, { useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 180;
const nodeHeight = 50;

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
    return newNode;
  });

  return { nodes: newNodes, edges };
};

export default function KnowledgeGraph({ data }: { data: any }) {
  const initialNodes = data?.nodes?.map((n: any) => ({
    id: n.id,
    data: { label: n.label },
    position: { x: 0, y: 0 },
    style: {
      background: 'rgba(99, 102, 241, 0.1)',
      color: '#c7d2fe',
      border: '1px solid rgba(99, 102, 241, 0.4)',
      borderRadius: '8px',
      padding: '10px',
      width: nodeWidth,
      textAlign: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  })) || [];

  const initialEdges = data?.edges?.map((e: any, i: number) => ({
    id: `e${e.source}-${e.target}-${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: { stroke: 'rgba(99, 102, 241, 0.5)', strokeWidth: 2 },
    labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 500 },
    labelBgStyle: { fill: 'rgba(15, 23, 42, 0.8)', stroke: 'rgba(99, 102, 241, 0.2)' },
    labelBgPadding: [4, 4],
    labelBgBorderRadius: 4,
  })) || [];

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges,
    'TB'
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      'TB'
    );
    setNodes(newLayoutedNodes);
    setEdges(newLayoutedEdges);
  }, [data]);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return <div className="h-48 bg-white/5 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-slate-400">No graph data generated.</div>;
  }

  return (
    <div style={{ width: '100%', height: '400px' }} className="rounded-xl overflow-hidden border border-white/10 bg-[#0f172a]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#334155" gap={16} />
        <Controls style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', fill: '#c7d2fe', border: '1px solid rgba(255,255,255,0.1)' }} />
      </ReactFlow>
    </div>
  );
}
