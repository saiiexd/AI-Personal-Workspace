"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth-store";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { GradientArt } from "@/components/ui/gradient-art";

export default function WorkspacesPage() {
  const { user } = useAuthStore();
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col justify-between px-8 md:px-20 py-12 z-10 overflow-hidden">
      
      {/* Editorial Intelligence Field Art */}
      <GradientArt type="intelligence" />

      {/* Hero Narrative Section */}
      <div className="max-w-4xl mt-12 md:mt-24 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-xs uppercase tracking-[0.3em] text-[#e0d7c7] mb-6 font-medium"
        >
          Active Node / {user?.firstName || "Intelligence Partner"}
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-8xl font-light tracking-tight text-white mb-8 leading-[1.05]"
        >
          Your Second <span className="italic font-serif text-[#e0d7c7]">Brain</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-2xl"
        >
          A single, unified network of your intelligence, memory, and actions. Antigravity connects your documents, tasks, and notes into an active spatial environment.
        </motion.p>
      </div>

      {/* Asymmetric Knowledge Stats & Actions - No Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 items-end mt-20 relative z-10 border-t border-white/5 pt-12">
        
        {/* Memory Segment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="group cursor-default"
        >
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-xs uppercase tracking-widest text-white/40">Knowledge Base</span>
            <span className="text-[10px] font-mono text-[#c8dad1]">+3 today</span>
          </div>
          <div className="h-px bg-white/10 w-full mb-4 group-hover:bg-[#b8c2d1]/30 transition-colors duration-500" />
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-serif font-light text-white group-hover:text-[#b8c2d1] transition-colors duration-500">42</span>
            <span className="text-xs text-white/30 font-light">Indexed vectors</span>
          </div>
        </motion.div>

        {/* Momentum Segment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="group cursor-default"
        >
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-xs uppercase tracking-widest text-white/40">Active Directives</span>
            <span className="text-[10px] font-mono text-[#ebd7c8]">High priority</span>
          </div>
          <div className="h-px bg-white/10 w-full mb-4 group-hover:bg-[#ebd7c8]/30 transition-colors duration-500" />
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-serif font-light text-white group-hover:text-[#ebd7c8] transition-colors duration-500">12</span>
            <span className="text-xs text-white/30 font-light">Directives executing</span>
          </div>
        </motion.div>

        {/* CTA Segment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col items-start"
        >
          <div className="text-xs uppercase tracking-widest text-white/40 mb-3">System Hub</div>
          <div className="h-px bg-white/10 w-full mb-6" />
          <Link 
            href="/ai"
            className="flex items-center gap-2 group text-sm text-[#e0d7c7] hover:text-white transition-colors duration-500"
          >
            <span>Begin intelligence session</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </Link>
        </motion.div>

      </div>

      {/* System Footer Metadata */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px] font-mono text-white/20 tracking-widest uppercase mt-16 pt-8 border-t border-white/5 relative z-10">
        <div>Platform v1.2.0 / Spatial OS</div>
        <div>Local Environment: Standard Time {time}</div>
      </div>

    </div>
  );
}
