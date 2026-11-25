import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, FileText, MessageSquare, AlertTriangle, Calendar, LayoutDashboard, Network, File as FileIcon, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import type { World, FileOut } from '../types';
import { cn } from '../lib/utils';
import { WorldGraph } from '../components/graph/WorldGraph';
import { FileUploader } from '../components/shared/FileUploader';

export const WorldDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [world, setWorld] = useState<World | null>(null);
  const [files, setFiles] = useState<FileOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchWorldAndFiles = useCallback(async () => {
    try {
      const [worldRes, filesRes] = await Promise.all([
        api.get(`/worlds/${id}`),
        api.get(`/worlds/${id}/files`)
      ]);
      setWorld(worldRes.data);
      setFiles(filesRes.data);
    } catch (error) {
      toast.error('Failed to load world details');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchWorldAndFiles();
  }, [fetchWorldAndFiles]);

  const handleUpload = async (selectedFiles: File[]) => {
    setIsUploading(true);
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        await api.post(`/worlds/${id}/files`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      toast.success('Files uploaded successfully!');
      fetchWorldAndFiles(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'image': return <ImageIcon className="h-5 w-5 text-blue-500" />;
      case 'excel': return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      default: return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

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
    { id: 'graph', label: 'Graph View', icon: Network },
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

        {activeTab === 'graph' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Knowledge Graph</h3>
              <span className="text-xs text-foreground/50 bg-background px-3 py-1 rounded-full border border-border">
                ⚡ Mock Data (Demo)
              </span>
            </div>
            <WorldGraph />
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-8">
            <FileUploader onUpload={handleUpload} isUploading={isUploading} />

            <div className="border-t border-border pt-8">
              <h3 className="text-lg font-bold mb-4">Uploaded Files ({files.length})</h3>
              
              {files.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-foreground/60">No files uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-background p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="bg-card p-2.5 rounded-lg border border-border">
                          {getFileIcon(file.file_type)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm truncate max-w-md">{file.filename}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-foreground/50">
                              {new Date(file.uploaded_at).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] uppercase font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                              {file.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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