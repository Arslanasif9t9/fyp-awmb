import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, FileText, MessageSquare, AlertTriangle, Calendar, LayoutDashboard, Network, File as FileIcon, Image as ImageIcon, FileSpreadsheet, History, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import type { World, FileOut, EvidenceOut, ChangeLogOut } from '../types';
import { cn } from '../lib/utils';
import { WorldGraph } from '../components/graph/WorldGraph';
import { FileUploader } from '../components/shared/FileUploader';
import { EvidenceModal } from '../components/shared/EvidenceModal';
import { QAChat } from '../components/shared/QAChat';

export const WorldDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [world, setWorld] = useState<World | null>(null);
  const [files, setFiles] = useState<FileOut[]>([]);
  const [history, setHistory] = useState<ChangeLogOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileForEvidence, setSelectedFileForEvidence] = useState<FileOut | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceOut[]>([]);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchWorldData = useCallback(async () => {
    try {
      const [worldRes, filesRes, historyRes] = await Promise.all([
        api.get(`/worlds/${id}`),
        api.get(`/worlds/${id}/files`),
        api.get(`/worlds/${id}/history`)
      ]);
      setWorld(worldRes.data);
      setFiles(filesRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      toast.error('Failed to load world details');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchWorldData();
  }, [fetchWorldData]);

  const handleViewEvidence = async (file: FileOut) => {
    try {
      const response = await api.get(`/worlds/${id}/files/${file.id}/evidence`);
      setEvidenceList(response.data);
      setSelectedFileForEvidence(file);
      setIsEvidenceModalOpen(true);
    } catch (error) {
      toast.error('Failed to load evidence');
    }
  };

  const handleToggleStatus = async (file: FileOut, action: 'deactivate' | 'reactivate') => {
    if (action === 'deactivate' && !window.confirm("Are you sure you want to deactivate this file? It will be hidden from AI queries.")) {
      return;
    }

    try {
      await api.post(`/worlds/${id}/files/${file.id}/${action}`);
      toast.success(`File ${action}d successfully`);
      fetchWorldData(); // Refresh list and history
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${action} file`);
    }
  };

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
      fetchWorldData();
    } catch (error: any) {
      let errorMessage = 'Failed to upload files';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      toast.error(errorMessage);
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
    { id: 'history', label: 'History', icon: History }, // <-- Naya History Tab
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
                    <div key={file.id} className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-colors",
                      file.status === 'ACTIVE' ? "bg-background border-border hover:border-primary/30" : "bg-background/50 border-border/50 opacity-70"
                    )}>
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="bg-card p-2.5 rounded-lg border border-border">
                          {getFileIcon(file.file_type)}
                        </div>
                        <div>
                          <p className={cn("font-semibold text-sm truncate max-w-md", file.status !== 'ACTIVE' && "line-through text-foreground/50")}>
                            {file.filename}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-foreground/50">
                              {new Date(file.uploaded_at).toLocaleDateString()}
                            </span>
                            <span className={cn(
                              "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                              file.status === 'ACTIVE' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                            )}>
                              {file.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleViewEvidence(file)}>
                          View Text
                        </Button>
                        
                        {file.status === 'ACTIVE' ? (
                          <Button variant="danger" size="sm" onClick={() => handleToggleStatus(file, 'deactivate')}>
                            Deactivate
                          </Button>
                        ) : (
                          <Button variant="primary" size="sm" onClick={() => handleToggleStatus(file, 'reactivate')}>
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NAYA: History Tab Content */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Change History</h3>
              <span className="text-xs text-foreground/50 bg-background px-3 py-1 rounded-full border border-border">
                Audit Trail
              </span>
            </div>
            
            {history.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">No history yet</h3>
                <p className="text-foreground/60">Actions like uploading or deactivating files will appear here.</p>
              </div>
            ) : (
              <div className="relative border-l border-border ml-4 space-y-8 pb-4">
                {history.map((log) => (
                  <div key={log.id} className="relative pl-6">
                    <div className={cn(
                      "absolute -left-3 top-1 h-6 w-6 rounded-full border-2 border-background flex items-center justify-center",
                      log.action === 'DEACTIVATE' ? "bg-yellow-500/20" : "bg-green-500/20"
                    )}>
                      {log.action === 'DEACTIVATE' ? (
                        <ArrowDownCircle className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="bg-background border border-border p-4 rounded-xl shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-sm">
                          {log.action === 'DEACTIVATE' ? 'File Deactivated' : 'File Reactivated'}
                        </p>
                        <span className="text-xs text-foreground/50">
                          {new Date(log.performed_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/70">
                        A {log.target_type} item was changed from <span className="font-mono text-xs bg-card px-1 rounded">{log.old_state}</span> to <span className="font-mono text-xs bg-card px-1 rounded">{log.new_state}</span>.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'qa' && (
          <QAChat worldId={world.id} />
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

      <EvidenceModal 
        isOpen={isEvidenceModalOpen} 
        onClose={() => setIsEvidenceModalOpen(false)} 
        evidence={evidenceList}
        filename={selectedFileForEvidence?.filename || ''}
      />
    </div>
  );
};