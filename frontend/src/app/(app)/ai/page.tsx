"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Command, Plus, MessageSquare, Trash, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAI } from "@/hooks/use-ai";

export default function AIPage() {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const { conversations, messages, isConversationsLoading, isMessagesLoading, createConversation, deleteConversation, sendMessage } = useAI(activeConvId);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendMessage.isPending]);

  const handleCreateConversation = async () => {
    const title = prompt("Enter conversation title:");
    if (!title || !title.trim()) return;
    const newConv = await createConversation.mutateAsync(title);
    setActiveConvId(newConv.id);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    await deleteConversation.mutateAsync(id);
    if (activeConvId === id) {
      setActiveConvId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConvId) return;

    const queryText = input;
    setInput("");
    await sendMessage.mutateAsync({ content: queryText });
  };

  return (
    <div className="flex h-full">
      {/* Conversation History Sidebar */}
      <div className="w-64 border-r border-white/5 bg-background flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-200">Chats</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCreateConversation}
            className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isConversationsLoading ? (
            <div className="text-center text-zinc-500 py-4 text-xs">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-zinc-500 py-4 text-xs">No conversations. Click "+" to start one.</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm group ${
                  activeConvId === conv.id 
                    ? "bg-white/10 text-zinc-100 font-medium" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 p-0.5 transition-opacity"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-950/50">
        {activeConvId ? (
          <>
            <div className="h-14 border-b border-white/5 flex items-center px-6 shrink-0 justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="font-semibold tracking-tight text-zinc-100">
                  {conversations.find((c) => c.id === activeConvId)?.title || "AI Assistant"}
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:px-24">
              <div className="max-w-3xl mx-auto space-y-8 pb-8">
                {isMessagesLoading ? (
                  <div className="text-center text-zinc-500 py-12">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-zinc-500 py-12">No messages in this conversation yet. Send one below!</div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role !== 'user' && (
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-purple-400" />
                        </div>
                      )}
                      
                      <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        <div className={`p-4 rounded-2xl ${
                          msg.role === 'user' 
                            ? 'bg-zinc-800 text-zinc-100 rounded-tr-sm' 
                            : 'bg-zinc-900 border border-white/10 text-zinc-300 rounded-tl-sm'
                        }`}>
                          <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        
                        {msg.context_sources && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(msg.context_sources).map(([key, source]: [string, any]) => (
                              <span key={key} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-white/5 border border-white/10 text-zinc-500 hover:text-zinc-300 transition-colors">
                                <Command className="w-3 h-3" /> Source: {source.title || source.document_title || "Document Chunks"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-zinc-400" />
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
                {sendMessage.isPending && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
                    </div>
                    <div className="flex flex-col items-start max-w-[80%]">
                      <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 text-zinc-500 rounded-tl-sm text-sm italic">
                        Thinking and retrieving workspace context...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border-t border-white/5">
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about your notes, tasks, or documents..."
                    className="pr-12 bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500/50"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="absolute right-1 w-10 h-10 rounded-lg bg-transparent hover:bg-white/10 text-zinc-400 hover:text-zinc-100"
                    disabled={!input.trim() || sendMessage.isPending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <div className="mt-2 text-center">
                  <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">Powered by Semantic Search & RAG</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-4">
            <Sparkles className="w-12 h-12 text-purple-500/40" />
            <p>Select or create a conversation to start chatting with your workspace.</p>
            <Button onClick={handleCreateConversation}>Create Conversation</Button>
          </div>
        )}
      </div>
    </div>
  );
}
