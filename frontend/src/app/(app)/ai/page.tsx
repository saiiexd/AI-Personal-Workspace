"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { motion } from "framer-motion";
import { staggerContainer, itemVariants } from "@/lib/animations";
import { Send, Sparkles, BookOpen, Clock, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntelligenceWorkspace() {
  return (
    <PageTransition className="min-h-screen relative flex flex-col h-screen">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <MeshGradient colors={["from-indigo-600/10", "via-purple-600/10", "to-fuchsia-600/10", "bg-background"]} />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-32">
        <div className="max-w-4xl mx-auto px-8 pt-24">
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="flex flex-col gap-12">
            
            {/* Context Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                <Fingerprint className="w-8 h-8 text-primary relative z-10" />
              </div>
              <Typography variant="h2" className="mb-4">Intelligence Workspace</Typography>
              <Typography variant="lead">
                I am synthesizing information across your 1,248 documents and 342 notes. How can I assist your deep work today?
              </Typography>
            </motion.div>

            {/* Conversation Flow - Premium Presentation */}
            <div className="space-y-16">
              {/* User Input representation */}
              <motion.div variants={itemVariants} className="flex flex-col items-end">
                <div className="max-w-[80%] bg-white/5 border border-white/10 rounded-3xl rounded-tr-sm p-6 backdrop-blur-sm">
                  <Typography variant="p" className="mt-0 text-white/90 text-lg">
                    Summarize the key architectural decisions from my Q3 engineering documents and relate them to our current technical debt.
                  </Typography>
                </div>
              </motion.div>

              {/* AI Response Presentation */}
              <motion.div variants={itemVariants} className="flex flex-col items-start w-full">
                <div className="flex items-center gap-3 mb-4 text-primary">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium tracking-widest uppercase">Synthesizing Knowledge</span>
                </div>
                
                <div className="w-full glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                  
                  <Typography variant="p" className="text-lg leading-relaxed text-white/80 mt-0 mb-8">
                    Based on an analysis of <span className="text-white font-medium border-b border-white/20 pb-0.5 cursor-pointer">5 referenced documents</span>, the architectural decisions from Q3 reflect a shift towards micro-frontends and event-driven backends.
                  </Typography>

                  {/* Contextual Citations / Knowledge Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-3 text-white/40">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider">Architecture_v3.pdf</span>
                      </div>
                      <p className="text-sm text-white/70">&ldquo;Moving to an event-driven model will decouple the notification service from the main monolith...&rdquo;</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-3 text-white/40">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider">Q3_Planning_Notes.md</span>
                      </div>
                      <p className="text-sm text-white/70">&ldquo;Technical debt in the routing layer must be addressed before implementing micro-frontends.&rdquo;</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <Typography variant="h4" className="mb-4 text-white">Impact on Technical Debt</Typography>
                    <ul className="space-y-4">
                      <li className="flex gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-white/70">The event-driven shift mitigates debt in the synchronous API layer but introduces new observability challenges.</span>
                      </li>
                      <li className="flex gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-white/70">Routing layer debt was explicitly flagged as a blocker.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* Floating Premium Input Bar */}
      <div className="absolute bottom-0 left-0 w-full p-8 z-20 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-cyan-400/30 rounded-[32px] blur-lg opacity-50" />
          <div className="relative bg-background border border-white/10 rounded-[28px] p-2 flex items-end shadow-2xl">
            <textarea 
              className="w-full bg-transparent min-h-[56px] max-h-48 resize-none text-foreground p-4 focus:outline-none custom-scrollbar text-lg"
              placeholder="Ask anything about your knowledge base..."
              rows={1}
            />
            <div className="p-2 shrink-0">
              <Button size="icon" className="rounded-full h-12 w-12 bg-white text-black hover:bg-white/90">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

    </PageTransition>
  );
}
