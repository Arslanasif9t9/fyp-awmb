import { useCallback, useEffect, useState } from 'react';
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
import { User, Building2, AlertTriangle, FileText, Loader2, Network } from 'lucide-react';
import { api } from '../../lib/api';
import type { GraphDataOut } from '../../types';
import { toast } from 'sonner';

// Custom Node Component
const CustomNode = ({ data }: any) => {
  const icons = {
    Person: <User className="h-4 w-4 text-blue-500" />,
    Organization: <Building2 className="h-4 w-4 text-purple-500" />,
    Location: <AlertTriangle className="h-4 w-4 text-orange-500" />,
    Concept: <FileText className="h-4 w-4 text-green-500" />,
  };

  const Icon = icons[data.type as keyof typeof icons] || <FileText className="h-4 w-4 text-gray-500" />;

  return (
    <div className="bg-card border-2 border-primary/50 rounded-xl px-4 py-3 shadow-xl min-w-[150px]">
      <div className="flex items-center gap-2 mb-1">
        {Icon}
        <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">
          {data.type}
        </span>
      </div>
      <div className="font-semibold text-foreground">{data.label}</div>
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

export const WorldGraph = ({ worldId }: { worldId: string }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await api.get<GraphDataOut>(`/worlds/${worldId}/graph`);
        const { entities, relations } = response.data;

        // Map Entities to React Flow Nodes
        const newNodes: Node[] = entities.map((ent, index) => ({
          id: ent.id,
          type: 'custom',
          position: {
            // Simple circular layout
            x: 250 + 200 * Math.cos((index / entities.length) * 2 * Math.PI),
            y: 250 + 200 * Math.sin((index / entities.length) * 2 * Math.PI),
          },
          data: { label: ent.name, type: ent.entity_type },
        }));

        // Map Relations to React Flow Edges
        const newEdges: Edge[] = relations.map((rel) => ({
          id: rel.id,
          source: rel.source_entity_id,
          target: rel.target_entity_id,
          label: rel.relation_type,
          animated: true,
          style: { stroke: '#6366F1', strokeWidth: 2 },
        }));

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (error) {
        toast.error('Failed to load graph data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraph();
  }, [worldId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center border border-border rounded-xl bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-foreground/60">Loading Knowledge Graph...</p>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center border border-border border-dashed rounded-xl bg-background text-center p-6">
        <Network className="h-12 w-12 text-foreground/20 mb-4" />
        <h3 className="text-lg font-bold mb-2">Graph is empty</h3>
        <p className="text-sm text-foreground/60 max-w-md">
          No entities found. Go to the Files tab and trigger extraction, or upload more files.
        </p>
      </div>
    );
  }

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