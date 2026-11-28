import { useState } from 'react';
import { Sparkles, AlertCircle, TrendingUp, GitBranch, ShieldCheck, Loader2, Lightbulb } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import type { WhatIfResponse } from '../../types';
import { cn } from '../../lib/utils';

const SUGGESTIONS = [
  "What if the budget was higher?",
  "What if the main source is removed?",
  "What if the price increased by 20%?",
];

export const WhatIfPanel = ({ worldId }: { worldId: string }) => {
  const [assumption, setAssumption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WhatIfResponse | null>(null);

  const handleSimulate = async (text?: string) => {
    const finalAssumption = text || assumption.trim();
    if (!finalAssumption) return;

    setIsLoading(true);
    setResult(null);
    try {
      const response = await api.post<WhatIfResponse>(
        `/worlds/${worldId}/whatif`,
        { assumption: finalAssumption }
      );
      setResult(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Simulation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const confidenceColor = {
    HIGH: 'bg-green-500/10 text-green-500 border-green-500/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    LOW: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-primary">Non-Persistent Simulation</h4>
          <p className="text-xs text-foreground/70 mt-1">
            This is a what-if analysis. Your stored world will <strong>not</strong> be modified. 
            Results are based only on your uploaded evidence.
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Your Assumption</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={assumption}
            onChange={(e) => setAssumption(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
            placeholder="What if...? (e.g., 'What if the loan was only 1 crore?')"
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            disabled={isLoading}
          />
          <Button onClick={() => handleSimulate()} disabled={!assumption.trim() || isLoading} className="gap-2 shrink-0">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Simulate
          </Button>
        </div>

        {/* Suggestions */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <Lightbulb className="h-3.5 w-3.5 text-foreground/40" />
          <span className="text-xs text-foreground/40">Try:</span>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => { setAssumption(s); handleSimulate(s); }}
              disabled={isLoading}
              className="text-xs bg-background border border-border hover:border-primary/50 hover:text-primary px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-foreground/80">Simulating consequences...</p>
          <p className="text-xs text-foreground/50">Analyzing your evidence with AI</p>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Assumption Header */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-foreground/50 font-bold mb-1">Assumption</p>
            <p className="font-semibold text-foreground">"{result.assumption}"</p>
          </div>

          {/* First & Second Order */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* First Order */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">First-Order Effects</h4>
                  <p className="text-xs text-foreground/50">Direct, immediate consequences</p>
                </div>
              </div>
              {result.first_order.length === 0 ? (
                <p className="text-sm text-foreground/50 italic py-4">No first-order effects identified from evidence.</p>
              ) : (
                <ul className="space-y-2">
                  {result.first_order.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground/80 bg-background p-2.5 rounded-lg border border-border/50">
                      <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Second Order */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <GitBranch className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Second-Order Effects</h4>
                  <p className="text-xs text-foreground/50">Indirect, ripple consequences</p>
                </div>
              </div>
              {result.second_order.length === 0 ? (
                <p className="text-sm text-foreground/50 italic py-4">No second-order effects identified.</p>
              ) : (
                <ul className="space-y-2">
                  {result.second_order.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground/80 bg-background p-2.5 rounded-lg border border-border/50">
                      <span className="text-accent font-bold shrink-0">{i + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Confidence & Reasoning */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">Confidence Level</h4>
              <span className={cn(
                "text-xs font-bold uppercase px-3 py-1 rounded-full border",
                confidenceColor[result.confidence]
              )}>
                {result.confidence}
              </span>
            </div>
            {result.reasoning && (
              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/50 font-bold mb-1">Reasoning</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{result.reasoning}</p>
              </div>
            )}
          </div>

          {/* Citations */}
          {result.citations.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-bold text-sm mb-3">Evidence Used</h4>
              <div className="space-y-2">
                {result.citations.map((cite, i) => (
                  <div key={i} className="text-xs bg-background p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {cite.source_file || 'User Claim'}
                      </span>
                      {cite.chunk_ref && (
                        <span className="text-[10px] text-foreground/40">{cite.chunk_ref}</span>
                      )}
                    </div>
                    <p className="text-foreground/70 italic">"{cite.claim_text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/70">{result.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};