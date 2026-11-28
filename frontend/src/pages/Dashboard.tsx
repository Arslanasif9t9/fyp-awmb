import { useState, useEffect } from 'react';
import { Plus, Globe, FileText, Activity, AlertCircle, Database, Network } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { WorldCard } from '../components/shared/WorldCard';
import { CreateWorldModal } from '../components/shared/CreateWorldModal';
import { api } from '../lib/api';
import type { World, WorldStats } from '../types';
import { useAuthStore } from '../store/auth';

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [stats, setStats] = useState({ files: 0, evidence: 0, entities: 0, contradictions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchWorldsAndStats = async () => {
    try {
      const response = await api.get('/worlds');
      setWorlds(response.data);

      // Fetch stats for all worlds and sum them up
      if (response.data.length > 0) {
        const statsPromises = response.data.map((w: World) => api.get(`/worlds/${w.id}/stats`));
        const statsResponses = await Promise.all(statsPromises);
        
        const total = statsResponses.reduce((acc, res) => {
          const s: WorldStats = res.data;
          return {
            files: acc.files + s.files_count,
            evidence: acc.evidence + s.evidence_count,
            entities: acc.entities + s.entities_count,
            contradictions: acc.contradictions + s.contradictions_count,
          };
        }, { files: 0, evidence: 0, entities: 0, contradictions: 0 });
        
        setStats(total);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorldsAndStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-foreground/60 mt-1">Manage your worlds and explore your data.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 w-full md:w-auto">
          <Plus className="h-4 w-4" /> Create World
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg"><Globe className="h-5 w-5 text-primary" /></div>
          <div><p className="text-xs md:text-sm text-foreground/60 font-medium">Worlds</p><h3 className="text-xl md:text-2xl font-bold">{worlds.length}</h3></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="bg-accent/10 p-3 rounded-lg"><FileText className="h-5 w-5 text-accent" /></div>
          <div><p className="text-xs md:text-sm text-foreground/60 font-medium">Files</p><h3 className="text-xl md:text-2xl font-bold">{stats.files}</h3></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="bg-blue-500/10 p-3 rounded-lg"><Network className="h-5 w-5 text-blue-500" /></div>
          <div><p className="text-xs md:text-sm text-foreground/60 font-medium">Entities</p><h3 className="text-xl md:text-2xl font-bold">{stats.entities}</h3></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="bg-red-500/10 p-3 rounded-lg"><AlertCircle className="h-5 w-5 text-red-500" /></div>
          <div><p className="text-xs md:text-sm text-foreground/60 font-medium">Conflicts</p><h3 className="text-xl md:text-2xl font-bold">{stats.contradictions}</h3></div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Your Worlds</h2>
        {worlds.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4"><Activity className="h-8 w-8 text-primary" /></div>
            <h3 className="text-lg font-bold mb-2">No worlds yet</h3>
            <p className="text-foreground/60 max-w-sm mb-6">Create your first world to start uploading files and asking grounded questions.</p>
            <Button onClick={() => setIsModalOpen(true)}>Create Your First World</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {worlds.map((world) => <WorldCard key={world.id} world={world} />)}
          </div>
        )}
      </div>

      <CreateWorldModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchWorldsAndStats} />
    </div>
  );
};