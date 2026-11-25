import { X, Database, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import type { EvidenceOut } from '../../types';
import { cn } from '../../lib/utils';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceOut[];
  filename: string;
  onToggleStatus: (evidence: EvidenceOut, action: 'deactivate' | 'reactivate') => void;
}

export const EvidenceModal = ({ isOpen, onClose, evidence, filename, onToggleStatus }: EvidenceModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-3xl max-h-[80vh] rounded-2xl border border-border shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Extracted Evidence</h2>
              <p className="text-sm text-foreground/60">{filename}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2 h-auto">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-background/50">
          {evidence.length === 0 ? (
            <p className="text-center text-foreground/60 py-8">No text could be extracted from this file.</p>
          ) : (
            evidence.map((item, idx) => (
              <div key={item.id} className={cn(
                "bg-card border p-4 rounded-xl transition-all",
                item.status === 'ACTIVE' ? "border-border" : "border-yellow-500/30 opacity-60 bg-yellow-500/5"
              )}>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase">Chunk {idx + 1}</span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                      item.status === 'ACTIVE' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {item.status}
                    </span>
                  </div>
                  <Button 
                    variant={item.status === 'ACTIVE' ? 'danger' : 'primary'} 
                    size="sm"
                    onClick={() => onToggleStatus(item, item.status === 'ACTIVE' ? 'deactivate' : 'reactivate')}
                  >
                    {item.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                  </Button>
                </div>
                <p className={cn("text-sm whitespace-pre-wrap font-mono", item.status === 'ACTIVE' ? "text-foreground/80" : "text-foreground/50 line-through")}>
                  {item.claim_text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};