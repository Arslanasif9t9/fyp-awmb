import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Search, BrainCircuit } from 'lucide-react';
import { Button } from '../ui/Button';
import type { EvidenceOut } from '../../types';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: EvidenceOut[];
  isStreaming?: boolean;
}

export const QAChat = ({ worldId }: { worldId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStatus]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setCurrentStatus('Initializing...');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/worlds/${worldId}/qa-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: userMessage })
      });

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      let finalCitations: EvidenceOut[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]' || !dataStr) continue;
            
            try {
              const parsed = JSON.parse(dataStr);

              if (parsed.type === 'status') {
                setCurrentStatus(parsed.message);
              } else if (parsed.type === 'token') {
                assistantText += parsed.text;
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
                    const newArr = [...prev];
                    // Object mutating ki jagah naya object banaya taake double render na ho
                    newArr[newArr.length - 1] = { ...lastMsg, content: assistantText };
                    return newArr;
                  } else {
                    return [...prev, { role: 'assistant', content: assistantText, isStreaming: true }];
                  }
                });
              } else if (parsed.type === 'citations') {
                finalCitations = parsed.data;
              } else if (parsed.type === 'error') {
                const errorMsg = `\n\n**Error:** ${parsed.message}`;
                assistantText += errorMsg;
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
                    const newArr = [...prev];
                    newArr[newArr.length - 1] = { ...lastMsg, content: assistantText, isStreaming: false };
                    return newArr;
                  } else {
                    return [...prev, { role: 'assistant', content: errorMsg, isStreaming: false }];
                  }
                });
              }
            } catch (e) {
              console.error("Parse error", e);
            }
          }
        }
      }

      // Finalize: Fix for duplicate box
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
          const newArr = [...prev];
          newArr[newArr.length - 1] = {
            ...lastMsg,
            citations: finalCitations,
            isStreaming: false,
            content: lastMsg.content || "AI returned an empty response."
          };
          return newArr;
        }
        
        if (assistantText) {
          return [...prev, { role: 'assistant', content: assistantText, citations: finalCitations, isStreaming: false }];
        }
        
        return prev;
      });

    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        const errorMsg = "Sorry, connection failed. Please check your internet and try again.";
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
          const newArr = [...prev];
          newArr[newArr.length - 1] = { ...lastMsg, content: errorMsg, isStreaming: false };
          return newArr;
        } else {
          return [...prev, { role: 'assistant', content: errorMsg, isStreaming: false }];
        }
      });
    } finally {
      setIsLoading(false);
      setCurrentStatus(null);
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
              <div className="bg-primary/20 h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            
            <div className={cn(
              "max-w-[80%] rounded-2xl p-4 text-sm",
              msg.role === 'user' 
                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                : "bg-card border border-border rounded-tl-sm shadow-sm"
            )}>
              
              {/* Markdown Rendering Fix */}
              <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
                {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />}
              </div>
              
              {/* Citations */}
              {!msg.isStreaming && msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/50">
                  <p className="text-xs font-bold text-foreground/50 mb-2 uppercase tracking-wider">Sources</p>
                  <div className="space-y-2">
                    {msg.citations.map((cite, i) => (
                      <div key={i} className="text-xs bg-background p-2.5 rounded-lg border border-border line-clamp-2 text-foreground/70 italic">
                        "{cite.claim_text.substring(0, 150)}..."
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="bg-foreground/10 h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1">
                <User className="h-4 w-4 text-foreground/70" />
              </div>
            )}
          </div>
        ))}

        {/* Real-time Status Indicator */}
        {isLoading && currentStatus && (
          <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-primary/20 h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-card border border-primary/20 rounded-2xl rounded-tl-sm p-3 flex items-center gap-3 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              {currentStatus.includes('Searching') ? (
                <Search className="h-4 w-4 animate-bounce text-accent" />
              ) : currentStatus.includes('AI') ? (
                <BrainCircuit className="h-4 w-4 animate-pulse text-primary" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              <span className="text-sm font-medium text-foreground/80">{currentStatus}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about your files..."
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground shadow-sm"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="shrink-0 h-auto px-6">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};