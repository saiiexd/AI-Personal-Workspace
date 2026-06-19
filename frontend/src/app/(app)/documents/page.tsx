"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { motion } from "framer-motion";
import { staggerContainer, itemVariants } from "@/lib/animations";
import { Link as LinkIcon, Sparkles, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KnowledgeLibrary() {
  const documents = [
    { title: "Q3 Strategy Architecture", type: "PDF", size: "2.4 MB", insight: "High relevance to 'Micro-frontends'", color: "from-blue-500/20 to-indigo-500/20" },
    { title: "Competitor Market Analysis", type: "DOCX", size: "1.1 MB", insight: "Contains new pricing models", color: "from-purple-500/20 to-fuchsia-500/20" },
    { title: "User Research Transcripts", type: "TXT", size: "45 KB", insight: "Mentions 'Fluid UI' 14 times", color: "from-cyan-500/20 to-blue-500/20" },
    { title: "Financial Projections FY26", type: "XLSX", size: "5.2 MB", insight: "Pending synthesis", color: "from-emerald-500/20 to-teal-500/20" },
  ];

  return (
    <PageTransition className="min-h-screen relative pb-24">
      {/* Immersive Header Environment */}
      <div className="relative h-[35vh] min-h-[250px] flex flex-col justify-end pb-12 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-0" />
        <MeshGradient className="opacity-20" colors={["from-cyan-600/10", "via-blue-600/10", "to-indigo-600/10", "bg-background"]} />
        
        <div className="relative z-10 max-w-6xl mx-auto w-full flex justify-between items-end">
          <div>
            <Typography variant="h1" className="mb-4 text-5xl">Knowledge Library</Typography>
            <Typography variant="lead" className="max-w-2xl">
              Your synthesized document ecosystem. Every file is a valuable source of intelligence.
            </Typography>
          </div>
          <Button size="lg" className="rounded-full shadow-[0_0_20px_-5px_var(--color-primary)] px-8">
            <UploadCloud className="w-5 h-5 mr-2" /> Upload Source
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 relative z-10 mt-8">
        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {documents.map((doc, i) => (
              <motion.div key={i} variants={itemVariants} className="group relative">
                {/* Document Card */}
                <div className="glass-panel rounded-3xl p-6 h-64 flex flex-col justify-between relative overflow-hidden cursor-pointer transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                  {/* Abstract Document Cover */}
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${doc.color} rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3 group-hover:scale-150 transition-transform duration-1000`} />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-2.5 py-1 rounded-md bg-white/10 text-[10px] font-bold tracking-widest uppercase text-white/70 backdrop-blur-md">
                        {doc.type}
                      </div>
                      <span className="text-xs text-white/40">{doc.size}</span>
                    </div>
                    <Typography variant="h4" className="text-xl leading-tight group-hover:text-white transition-colors">{doc.title}</Typography>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-white/10 mt-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span className="text-xs text-white/60 leading-relaxed">{doc.insight}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Semantic Graph Teaser */}
          <motion.div variants={itemVariants} className="mt-12 glass-panel rounded-3xl p-10 flex items-center justify-between relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <LinkIcon className="w-5 h-5" />
                <span className="text-sm font-medium tracking-widest uppercase">Semantic Discovery</span>
              </div>
              <Typography variant="h3" className="mb-2">Visualize Document Relationships</Typography>
              <Typography variant="muted">Explore how your Knowledge Library connects across 42 distinct semantic clusters.</Typography>
            </div>
            <Button variant="outline" className="relative z-10 rounded-full">Enter Graph View</Button>
          </motion.div>

        </motion.div>
      </div>
    </PageTransition>
  );
}
