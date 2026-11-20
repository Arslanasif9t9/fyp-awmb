import { useState, useEffect } from 'react';
import { Plus, Globe, FileText, Activity, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { WorldCard } from '../components/shared/WorldCard';
import { CreateWorldModal } from '../components/shared/CreateWorldModal';
import { api } from '../lib/api';
import type { World } from '../types';
import { useAuthStore } from '../store/auth';

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchWorlds = async () => {
    try {
      const response = await api.get('/worlds');
      setWorlds(response.data);
    } catch (error) {
      toast.error('Failed to load worlds');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorlds();
  }, []);

  // Stats calculations (placeholder for files/contradictions)
  const totalWorlds = worlds.length;
  const totalFiles = 0; // Will connect later
  const totalContradictions = 0; // Will connect later

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-foreground/60 mt-1">Manage your worlds and explore your data.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create World
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg"><Globe className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="text-sm text-foreground/60 font-medium">Total Worlds</p>
            <h3 className="text-2xl font-bold">{totalWorlds}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="bg-accent/10 p-3 rounded-lg"><FileText className="h-5 w-5 text-accent" /></div>
          <div>
            <p className="text-sm text-foreground/60 font-medium">Files Ingested</p>
            <h3 className="text-2xl font-bold">{totalFiles}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="bg-red-500/10 p-3 rounded-lg"><AlertCircle className="h-5 w-5 text-red-500" /></div>
          <div>
            <p className="text-sm text-foreground/60 font-medium">Contradictions</p>
            <h3 className="text-2xl font-bold">{totalContradictions}</h3>
          </div>
        </div>
      </div>

      {/* Worlds Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4">Your Worlds</h2>
        {worlds.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">No worlds yet</h3>
            <p className="text-foreground/60 max-w-sm mb-6">
              Create your first world to start uploading files and asking grounded questions.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>Create Your First World</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {worlds.map((world) => (
              <WorldCard key={world.id} world={world} />
            ))}
          </div>
        )}
      </div>

      <CreateWorldModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchWorlds} 
      />
    </div>
  );
};