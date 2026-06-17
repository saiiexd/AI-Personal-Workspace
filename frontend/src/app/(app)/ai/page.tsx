"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "I am ready. What would you like to explore?"
    }
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    // Mock response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          id: (Date.now() + 1).toString(), 
          role: "assistant", 
          content: "I am processing that directive. Your knowledge graph is actively restructuring." 
        }
      ]);
    }, 1500);
  };

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-between px-6 md:px-20 pt-32 pb-40 relative">
      
      {/* Messages Canvas */}
      <div className="w-full max-w-4xl flex flex-col gap-24">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col"
            >
              {msg.role === "assistant" ? (
                <div className="pl-0 md:pl-12 border-l border-white/10 py-2">
                  <span className="text-[10px] uppercase tracking-widest text-white/20 mb-4 block">Core Intelligence</span>
                  <p className="text-3xl md:text-5xl font-serif text-white/90 leading-tight">
                    {msg.content}
                  </p>
                </div>
              ) : (
                <div className="pr-0 md:pr-12 border-r border-white/10 py-2 self-end text-right">
                  <span className="text-[10px] uppercase tracking-widest text-white/20 mb-4 block">Directive</span>
                  <p className="text-xl md:text-3xl font-light text-white/60 leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Borderless Command Line */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 z-40">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Dictate your thoughts..."
            className="w-full bg-transparent border-none outline-none text-xl md:text-2xl font-light text-white placeholder:text-white/20 text-center pb-4 transition-all duration-700"
          />
          {/* Animated subtle underline */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-white/10 group-focus-within:w-full group-focus-within:bg-white/40 transition-all duration-1000 ease-[0.16,1,0.3,1]" />
        </form>
      </div>

    </div>
  );
}
