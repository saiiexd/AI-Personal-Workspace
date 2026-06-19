"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { motion } from "framer-motion";
import { staggerContainer, itemVariants } from "@/lib/animations";
import { ArrowUpRight, Brain, Activity, Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MissionControlPage() {
  return (
    <PageTransition className="min-h-screen relative pb-24">
      {/* Immersive Header Environment */}
      <div className="relative h-[40vh] min-h-[300px] flex flex-col justify-end pb-12 px-8 overflow-hidden">
        <MeshGradient className="opacity-30 absolute top-[-50%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-0" />
        
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <Typography variant="h1" className="mb-4 text-5xl">Mission Control</Typography>
          <Typography variant="lead" className="max-w-2xl">
            Your intelligence overview. Everything you know, what&apos;s changed, and what requires attention.
          </Typography>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Intelligence Summary - Large Editorial Section */}
          <motion.div variants={itemVariants} className="md:col-span-8 glass-panel rounded-3xl p-8 lg:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 transition-transform duration-1000 group-hover:scale-150" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium tracking-widest uppercase text-white/50">Neural Insight</span>
            </div>
            
            <Typography variant="h3" className="mb-6 font-light leading-snug">
              Based on your recent documents, there is a strong semantic connection forming around <span className="text-primary font-medium">Artificial General Intelligence</span> architectures and your upcoming strategy presentation.
            </Typography>
            
            <Button variant="glass" className="rounded-full mt-4">
              Explore Connections <ArrowUpRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>

          {/* Activity Pulse */}
          <motion.div variants={itemVariants} className="md:col-span-4 glass-panel rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium tracking-widest uppercase text-white/50">Pulse</span>
                <Activity className="w-4 h-4 text-white/30" />
              </div>
              <div className="space-y-4">
                {[
                  { title: "Project Q-Star", time: "2h ago", type: "Document" },
                  { title: "Q3 Planning", time: "4h ago", type: "Note" },
                  { title: "Competitor Analysis", time: "1d ago", type: "Insight" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-xs text-white/40">{item.type}</p>
                    </div>
                    <span className="text-xs text-white/30">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
              <span className="text-xs text-white/40 block">Total Knowledge Nodes</span>
              <span className="text-3xl font-display font-light">1,248</span>
            </div>
          </motion.div>

          {/* Deep Focus Tasks */}
          <motion.div variants={itemVariants} className="md:col-span-6 glass-panel rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-medium tracking-widest uppercase text-white/50">Deep Focus</span>
            </div>
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors cursor-pointer group">
                <h4 className="text-lg font-medium mb-2 group-hover:text-indigo-400 transition-colors">Finalize Architecture Review</h4>
                <p className="text-sm text-white/50 mb-4">Requires synthesizing insights from 3 documents.</p>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full w-[65%]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Knowledge Graph Preview */}
          <motion.div variants={itemVariants} className="md:col-span-6 glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[300px] group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium tracking-widest uppercase text-white/50">Knowledge Topology</span>
              </div>
            </div>
            <div className="relative z-10">
              <Typography variant="h4" className="mb-2">Expanding Clusters</Typography>
              <Typography variant="muted" className="mb-6">Your notes on React Server Components are forming new edges.</Typography>
              <Button variant="link" className="px-0 text-cyan-400">View Graph <ArrowUpRight className="ml-1 w-4 h-4" /></Button>
            </div>
            {/* Abstract visual representation of a node */}
            <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 border border-cyan-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
              <div className="w-48 h-48 border border-cyan-500/40 rounded-full flex items-center justify-center">
                <div className="w-32 h-32 bg-cyan-500/20 rounded-full blur-xl" />
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </PageTransition>
  );
}
