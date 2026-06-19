"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { motion } from "framer-motion";
import { staggerContainer, itemVariants } from "@/lib/animations";
import { PenTool, BrainCircuit, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotesExperience() {
  return (
    <PageTransition className="min-h-screen bg-background relative flex overflow-hidden">
      
      {/* Immersive Writing Environment */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-8 py-24">
        <div className="max-w-3xl mx-auto">
          
          <motion.div initial="hidden" animate="show" variants={staggerContainer}>
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-16">
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 tracking-widest uppercase">
                Draft
              </div>
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary tracking-widest uppercase flex items-center gap-2">
                <BrainCircuit className="w-3 h-3" />
                AI Context Active
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <textarea 
                className="w-full bg-transparent text-5xl md:text-7xl font-display font-light text-white tracking-tight resize-none focus:outline-none mb-8 placeholder:text-white/20"
                placeholder="Title..."
                defaultValue="The Future of Contextual Interfaces"
                rows={2}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="prose prose-invert prose-lg max-w-none">
              <textarea 
                className="w-full bg-transparent text-xl leading-relaxed text-white/80 resize-none focus:outline-none min-h-[50vh] custom-scrollbar placeholder:text-white/20"
                placeholder="Start writing..."
                defaultValue="Interfaces are no longer static canvases; they are fluid environments that mold themselves to the user's intent. When we consider the progression of UI paradigms, we move from the mechanical manipulation of the command line, to the spatial metaphors of the desktop, and now, to the semantic fluidty of the AI era."
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Contextual Intelligence Sidebar - Premium Glass Panel */}
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-96 border-l border-white/5 bg-white/[0.01] backdrop-blur-3xl hidden lg:flex flex-col relative z-20"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Typography variant="small" className="text-white/50 uppercase tracking-widest">Intelligence</Typography>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50"><Share2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50"><MoreHorizontal className="w-4 h-4" /></Button>
          </div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <Typography variant="small" className="text-white">Semantic Connections</Typography>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] cursor-pointer transition-colors">
                <p className="text-sm font-medium text-white mb-1">Spatial Computing Notes</p>
                <p className="text-xs text-white/40">Strong overlap with your thoughts on spatial metaphors.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] cursor-pointer transition-colors">
                <p className="text-sm font-medium text-white mb-1">Apple Vision Pro Analysis.pdf</p>
                <p className="text-xs text-white/40">Contains highly relevant data on UI fluidity.</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <PenTool className="w-4 h-4 text-cyan-400" />
              <Typography variant="small" className="text-white">AI Suggestions</Typography>
            </div>
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
              <p className="text-sm text-white/80 leading-relaxed mb-3">
                Consider elaborating on &ldquo;semantic fluidity&rdquo;. Do you mean the interface changing its layout dynamically, or the content itself adapting to user knowledge?
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs">Generate Expansion</Button>
            </div>
          </div>
        </div>
      </motion.div>

    </PageTransition>
  );
}
