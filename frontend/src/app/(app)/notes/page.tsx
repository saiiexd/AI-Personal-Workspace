"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function NotesPage() {
  const [content, setContent] = useState("");

  return (
    <div className="min-h-full w-full flex flex-col justify-start px-8 md:px-24 py-24 relative selection:bg-white/20 selection:text-white">
      
      <div className="max-w-3xl w-full mx-auto z-10 flex flex-col h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex justify-between items-center mb-16 opacity-0 hover:opacity-100 transition-opacity duration-700"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-medium">Drafting</span>
          <span className="text-[10px] font-mono text-white/20">Autosaved</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          {/* Borderless, toolbar-less text area simulating a spatial void */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Begin writing..."
            className="w-full h-[60vh] bg-transparent border-none outline-none resize-none text-2xl md:text-3xl font-serif text-white/80 placeholder:text-white/10 leading-relaxed tracking-wide custom-scrollbar"
          />
        </motion.div>
      </div>

    </div>
  );
}
