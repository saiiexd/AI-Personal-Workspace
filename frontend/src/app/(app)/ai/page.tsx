"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowRight, FileText, Sparkles, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAI } from "@/hooks/use-ai";
import { GradientArt } from "@/components/ui/gradient-art";

export default function AIPage() {
  const { conversations, createConversation, isConversationsLoading } = useAI();
  const conversationId = conversations[0]?.id;
  const { messages, isMessagesLoading, sendMessage, deleteConversation } = useAI(conversationId);
  
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isConversationsLoading && conversations.length === 0) {
      createConversation.mutate("Intelligence Session");
    }
  }, [isConversationsLoading, conversations.length, createConversation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isMessagesLoading) return;
    sendMessage.mutate({ content: input });
    setInput("");
  };

  const handleReset = () => {
    if (conversationId) {
      deleteConversation.mutate(conversationId);
    }
  };

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col justify-between z-10 overflow-hidden">
      
      {/* Volumetric AI Art Surface */}
      <GradientArt type="ai" />

      {/* Main Conversational Canvas */}
      <div className="flex-1 overflow-y-auto px-8 md:px-20 pt-8 pb-40 custom-scrollbar" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Large AI Hero (Empty State) */}
          {messages.length === 0 && !isMessagesLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-start pt-16 md:pt-24 max-w-2xl"
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#ebd7c8] mb-6 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Intelligence Workspace
              </div>
              <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-6 leading-tight">
                Traverse your <span className="italic font-serif text-[#ebd7c8]">mind</span>.
              </h1>
              <p className="text-lg text-white/50 font-light leading-relaxed mb-8">
                Antigravity bridges the gap between raw documents, tasks, and creative output. Search semantically, organize directives, and expand your network.
              </p>
              
              <button 
                onClick={() => setInput("Summarize my active tasks and projects")}
                className="flex items-center gap-2 group text-sm text-white/40 hover:text-white transition-colors duration-500"
              >
                <span>Try: "Summarize my active tasks and projects"</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </motion.div>
          )}

          {/* Conversational Stream */}
          <div className="space-y-16">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const isStreaming = msg.id === 'temp-assistant';
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${isUser ? 'ml-auto' : 'mr-auto'}`}
                  >
                    {/* Role Label */}
                    <span className="text-[10px] uppercase tracking-widest text-white/30 mb-3 block">
                      {isUser ? "Query" : "Response"}
                    </span>

                    {/* Content */}
                    <div className="relative w-full">
                      <div className={`text-xl md:text-2xl font-light leading-relaxed text-white/90 ${isUser ? 'italic text-right text-[#ebd7c8]' : 'text-left'}`}>
                        {msg.content || (isStreaming ? <span className="animate-pulse text-white/30">Formulating...</span> : "")}
                      </div>

                      {/* Context Citations */}
                      {!isUser && msg.context_sources && msg.context_sources.length > 0 && (
                        <div className="mt-8 flex flex-col gap-3">
                          <span className="text-xs uppercase tracking-widest text-white/30 flex items-center gap-1.5 font-light">
                            <Layers className="w-3.5 h-3.5" /> Core citations
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {msg.context_sources.map((doc: any, i: number) => {
                              const isActive = activeSourceIndex === i;
                              return (
                                <div key={i} className="flex flex-col">
                                  <button
                                    onClick={() => setActiveSourceIndex(isActive ? null : i)}
                                    className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all text-xs text-[#ebd7c8]"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-white/40" />
                                    <span>{doc.title || `Source ${i+1}`}</span>
                                  </button>
                                  {isActive && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      className="mt-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/50 max-w-md leading-relaxed"
                                    >
                                      {doc.content_preview || "No content preview available."}
                                    </motion.div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Loading Indicator */}
          {isMessagesLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-white/40 py-4"
            >
              <div className="w-2 h-2 rounded-full bg-[#ebd7c8] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-[#ebd7c8] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-[#ebd7c8] animate-bounce" style={{ animationDelay: '300ms' }} />
            </motion.div>
          )}

        </div>
      </div>

      {/* Floating Bottom Input Area */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 z-30">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ebd7c8]/20 via-[#b8c2d1]/20 to-[#dcd1eb]/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000" />
          
          <div className="relative flex items-center glass-dock px-6 py-2 border border-white/5 shadow-2xl">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Address the intelligence..."
              className="flex-1 bg-transparent border-none text-base placeholder:text-white/20 focus-visible:ring-0 text-white h-14"
              disabled={isMessagesLoading}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isMessagesLoading}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#ebd7c8] hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-[#ebd7c8]"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </form>

        <div className="flex justify-between mt-4 px-4">
          <button 
            onClick={handleReset}
            className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
          >
            Clear current stream
          </button>
          <span className="text-[10px] uppercase tracking-widest text-[#ebd7c8]/40">Node Alpha</span>
        </div>
      </div>

    </div>
  );
}
