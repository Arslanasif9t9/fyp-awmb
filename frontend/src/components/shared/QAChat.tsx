import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import type { QAResponse } from '../../types';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
}

export const QAChat = ({ worldId }: { worldId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post<QAResponse>(`/worlds/${worldId}/qa`, {
        question: userMessage
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.answer,
        citations: response.data.citations
      }]);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to get answer');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[550px] bg-background border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold">Ask Your World</h3>
          <p className="text-xs text-foreground/60">Answers are strictly based on your uploaded evidence.</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-foreground/40 space-y-2">
            <Bot className="h-12 w-12" />
            <p className="text-sm">Ask a question to start exploring your world's evidence.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
            {msg.role === 'assistant' && (
              <div className="bg-primary/20 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            
            <div className={cn(
              "max-w-[80%] rounded-2xl p-3 text-sm",
              msg.role === 'user' 
                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                : "bg-card border border-border rounded-tl-sm"
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              
              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs font-semibold text-foreground/50 mb-2">Sources:</p>
                  <div className="space-y-1">
                    {msg.citations.map((cite, i) => (
                      <div key={i} className="text-xs bg-background p-2 rounded border border-border line-clamp-2 font-mono text-foreground/60">
                        "{cite.claim_text.substring(0, 150)}..."
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="bg-foreground/10 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-foreground/70" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="bg-primary/20 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-foreground/60">Searching evidence...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about your files..."
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};