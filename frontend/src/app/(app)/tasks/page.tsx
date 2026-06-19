"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { motion } from "framer-motion";
import { staggerContainer, itemVariants } from "@/lib/animations";
import { CheckCircle2, Circle, Flame, Target } from "lucide-react";

export default function MomentumExperience() {
  const tasks = [
    { title: "Finalize Architecture Review", context: "Blocks Q3 Engineering", urgency: "High", completed: false },
    { title: "Synthesize user research interviews", context: "Connected to 3 documents", urgency: "Medium", completed: false },
    { title: "Update personal reading list", context: "Maintenance", urgency: "Low", completed: true },
    { title: "Draft Q4 OKRs", context: "Strategic Planning", urgency: "High", completed: false },
  ];

  return (
    <PageTransition className="min-h-screen bg-background relative pb-24">
      <div className="max-w-4xl mx-auto px-8 pt-32">
        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          
          <motion.div variants={itemVariants} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <span className="text-sm font-medium tracking-widest uppercase text-white/50 block">Current Momentum</span>
                <span className="text-orange-400 font-medium">4 Day Streak</span>
              </div>
            </div>
            <Typography variant="display" className="text-6xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
              Deep Focus
            </Typography>
            <Typography variant="lead">
              You have completed 12 items this week. 2 high-leverage tasks remain.
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            {tasks.map((task, i) => (
              <div 
                key={i} 
                className={`group flex items-center gap-6 p-6 rounded-3xl border transition-all duration-500 cursor-pointer ${
                  task.completed 
                    ? "bg-white/[0.01] border-transparent opacity-50" 
                    : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                <button className="shrink-0 text-white/30 group-hover:text-primary transition-colors">
                  {task.completed ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Circle className="w-6 h-6" />}
                </button>
                
                <div className="flex-1">
                  <h3 className={`text-lg font-medium mb-1 transition-colors ${task.completed ? "line-through text-white/50" : "text-white group-hover:text-primary"}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-white/40">{task.context}</span>
                    {!task.completed && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className={`flex items-center gap-1 ${task.urgency === 'High' ? 'text-orange-400' : 'text-white/40'}`}>
                          {task.urgency === 'High' && <Target className="w-3 h-3" />}
                          {task.urgency} Leverage
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {!task.completed && (
                  <div className="hidden md:flex items-center">
                    <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-white/20 w-1/3 group-hover:bg-primary transition-colors duration-500" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </PageTransition>
  );
}
