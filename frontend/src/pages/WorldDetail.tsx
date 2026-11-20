import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, FileText, MessageSquare, AlertTriangle, Calendar, LayoutDashboard, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import type { World } from '../types';
import { cn } from '../lib/utils';

export const WorldDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [world, setWorld] = useState<World | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchWorld = async () => {
      try {
        const response = await api.get(`/worlds/${id}`);
        setWorld(response.data);
      } catch (error) {
        toast.error('Failed to load world details');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorld();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!world) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'qa', label: 'Ask Q&A', icon: MessageSquare },
    { id: 'contradictions', label: 'Contradictions', icon: AlertTriangle },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="px-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{world.name}</h1>
            <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {world.domain}
            </span>
          </div>
          <p className="text-sm text-foreground/60 mt-1">{world.purpose}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "border-primary text-primary bg-primary/5 rounded-t-lg" 
                : "border-transparent text-foreground/60 hover:text-foreground hover:bg-card"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="bg-card border border-border rounded-xl p-6 min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="text-center py-12">
            <LayoutDashboard className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">World Overview</h3>
            <p className="text-foreground/60 max-w-md mx-auto">
              Here you will see a summary of your world, including stats about files, entities, and recent activity. This section is coming in the next phase.
            </p>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="text-center py-12">
            <div className="bg-background w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
              <FileText className="h-8 w-8 text-foreground/40" />
            </div>
            <h3 className="text-lg font-bold mb-2">No files uploaded yet</h3>
            <p className="text-foreground/60 max-w-md mx-auto mb-6">
              Upload PDFs, images, or text files to start building your world model.
            </p>
            <Button disabled className="gap-2">
              <Plus className="h-4 w-4" /> Upload File (Coming Soon)
            </Button>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Ask Questions</h3>
            <p className="text-foreground/60 max-w-md mx-auto">
              Once files are uploaded and processed, you can ask questions here and get answers strictly based on your uploaded evidence.
            </p>
          </div>
        )}

        {activeTab === 'contradictions' && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">No Contradictions Detected</h3>
            <p className="text-foreground/60 max-w-md mx-auto">
              The system will automatically highlight conflicting information between your sources once files are ingested.
            </p>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">World Timeline</h3>
            <p className="text-foreground/60 max-w-md mx-auto">
              Track how your world evolves over time. Every update, file addition, and contradiction will be logged here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};