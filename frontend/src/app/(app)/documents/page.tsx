"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function DocumentsPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Mock data
  const documents = [
    { id: "1", title: "Spatial OS Architecture Guidelines", category: "Technical", date: "2026.06.12" },
    { id: "2", title: "Q3 Intelligence Objectives", category: "Planning", date: "2026.06.10" },
    { id: "3", title: "Neural Synthesis Research", category: "Research", date: "2026.06.05" },
    { id: "4", title: "Atmospheric Visual Systems", category: "Design", date: "2026.05.28" },
  ];

  return (
    <div className="min-h-full w-full flex flex-col justify-start px-12 md:px-32 py-32 relative">
      
      {/* Background Graphic revealing on hover */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: hoveredId ? 0.05 : 0 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_#ffffff_0%,_transparent_70%)] blur-[80px]" />
      </div>

      <div className="max-w-4xl w-full mx-auto z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-12 font-medium"
        >
          Knowledge Index
        </motion.p>
        
        <div className="flex flex-col">
          {documents.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHoveredId(doc.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group cursor-pointer py-8 border-b border-white/[0.03] hover:border-white/20 transition-colors duration-700 flex flex-col md:flex-row md:items-baseline justify-between gap-4"
            >
              <h2 className="text-3xl md:text-5xl font-light text-white/50 group-hover:text-white transition-colors duration-700 tracking-tight">
                {doc.title}
              </h2>
              <div className="flex gap-8 items-baseline">
                <span className="text-[10px] uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors duration-500">
                  {doc.category}
                </span>
                <span className="text-[10px] font-mono text-white/10 group-hover:text-white/30 transition-colors duration-500">
                  {doc.date}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Upload Button (Borderless) */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors duration-500 relative group flex items-center gap-4"
        >
          <div className="w-8 h-[1px] bg-white/20 group-hover:bg-white group-hover:w-16 transition-all duration-700" />
          Ingest new document
        </motion.button>
      </div>

    </div>
  );
}
