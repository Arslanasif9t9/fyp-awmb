import { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import type { Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { User, Building2, AlertTriangle, FileText } from 'lucide-react';

// Custom Node Component for Premium Look
const CustomNode = ({ data }: any) => {
  const icons = {
    person: <User className="h-4 w-4 text-blue-500" />,
    organization: <Building2 className="h-4 w-4 text-purple-500" />,
    issue: <AlertTriangle className="h-4 w-4 text-red-500" />,
    document: <FileText className="h-4 w-4 text-green-500" />,
  };

  return (
    <div className="bg-card border-2 border-primary/50 rounded-xl px-4 py-3 shadow-xl min-w-[150px]">
      <div className="flex items-center gap-2 mb-1">
        {icons[data.type as keyof typeof icons] || <User className="h-4 w-4" />}
        <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">
          {data.type}
        </span>
      </div>
      <div className="font-semibold text-foreground">{data.label}</div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Mock Data (Baad mein backend se aayega)
const initialNodes: Node[] = [
  { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Ahmed', type: 'person' } },
  { id: '2', type: 'custom', position: { x: 100, y: 200 }, data: { label: 'Property A', type: 'document' } },
  { id: '3', type: 'custom', position: { x: 400, y: 200 }, data: { label: 'Property B', type: 'document' } },
  { id: '4', type: 'custom', position: { x: 400, y: 350 }, data: { label: 'Agent Imran', type: 'person' } },
  { id: '5', type: 'custom', position: { x: 600, y: 200 }, data: { label: 'Lawyer', type: 'person' } },
  { id: '6', type: 'custom', position: { x: 250, y: 400 }, data: { label: 'Mutation Issue', type: 'issue' } },
  { id: '7', type: 'custom', position: { x: 50, y: 400 }, data: { label: 'Meezan Bank', type: 'organization' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'interested in', animated: true, style: { stroke: '#6366F1', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', label: 'interested in', animated: true, style: { stroke: '#6366F1', strokeWidth: 2 } },
  { id: 'e4-3', source: '4', target: '3', label: 'represents', style: { stroke: '#14B8A6', strokeWidth: 2 } },
  { id: 'e5-3', source: '5', target: '3', label: 'warns about', style: { stroke: '#EF4444', strokeWidth: 2 } },
  { id: 'e6-3', source: '6', target: '3', label: 'affects', style: { stroke: '#EF4444', strokeWidth: 2, strokeDasharray: '5 5' } },
  { id: 'e7-1', source: '7', target: '1', label: 'offers loan', style: { stroke: '#14B8A6', strokeWidth: 2 } },
];

export const WorldGraph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-[600px] border border-border rounded-xl overflow-hidden bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Controls className="bg-card border-border fill-foreground" />
        <MiniMap 
          nodeColor={(n) => '#6366F1'} 
          maskColor="rgba(0,0,0,0.2)" 
          className="bg-card border-border"
        />
        <Background color="#94A3B8" gap={16} />
      </ReactFlow>
    </div>
  );
};