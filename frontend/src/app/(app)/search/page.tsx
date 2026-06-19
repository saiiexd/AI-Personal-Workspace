"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { motion } from "framer-motion";
import { staggerContainer, itemVariants } from "@/lib/animations";
import { Search as SearchIcon, Network, Sparkles, FileText, ArrowRight } from "lucide-react";

export default function DiscoveryExperience() {
  const results = [
    { type: "Semantic Cluster", title: "Micro-frontends & API Routing", match: "High Relevance", context: "Found across 3 architecture documents and 2 personal notes.", icon: Network },
    { type: "Document", title: "Q3_Architecture_Review.pdf", match: "Direct Mention", context: "Page 4 outlines the transition strategy.", icon: FileText },
    { type: "Note", title: "Thoughts on Event-Driven Systems", match: "Conceptual Overlap", context: "You wrote this 2 weeks ago regarding system resilience.", icon: FileText },
  ];

  return (
    <PageTransition className="min-h-screen relative flex flex-col h-screen">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <MeshGradient colors={["from-emerald-600/10", "via-cyan-600/10", "to-blue-600/10", "bg-background"]} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-4xl mx-auto px-8 pt-32 pb-32">
          
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mb-16">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-3xl blur-lg opacity-50 group-focus-within:opacity-100 transition-opacity duration-700" />
              <div className="relative flex items-center bg-background/50 backdrop-blur-2xl border border-white/10 rounded-[24px] p-2">
                <SearchIcon className="w-8 h-8 text-white/50 ml-4 mr-2" />
                <input 
                  type="text"
                  autoFocus
                  defaultValue="Micro-frontend routing"
                  className="w-full bg-transparent text-3xl md:text-5xl font-display font-light text-white px-4 py-4 focus:outline-none placeholder:text-white/20"
                  placeholder="Explore your second brain..."
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-12">
            
            {/* AI Synthesized Answer */}
            <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
              <div className="flex items-center gap-2 mb-4 text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-medium tracking-widest uppercase">Intelligence Synthesis</span>
              </div>
              <Typography variant="p" className="text-lg leading-relaxed text-white/90 mt-0">
                Your knowledge base indicates a strong focus on resolving routing complexities before adopting micro-frontends. The <span className="text-white font-medium border-b border-white/30 pb-0.5 cursor-pointer">Q3 Architecture Review</span> specifically notes that an event-driven model will decouple these concerns.
              </Typography>
            </motion.div>

            {/* Contextual Results */}
            <motion.div variants={itemVariants} className="space-y-4">
              <Typography variant="small" className="text-white/40 uppercase tracking-widest mb-6 block">Knowledge Graph Pathways</Typography>
              
              {results.map((result, i) => (
                <div key={i} className="group glass-panel rounded-2xl p-6 flex items-center gap-6 cursor-pointer hover:bg-white/[0.04] transition-colors border-white/[0.02] hover:border-white/[0.08]">
                  <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <result.icon className="w-5 h-5 text-white/60 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-medium uppercase tracking-widest text-cyan-400">{result.type}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-xs text-white/40">{result.match}</span>
                    </div>
                    <Typography variant="large" className="group-hover:text-white transition-colors">{result.title}</Typography>
                    <Typography variant="muted" className="mt-1">{result.context}</Typography>
                  </div>
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
