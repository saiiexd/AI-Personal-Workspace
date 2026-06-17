"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Refine atmospheric visual systems", completed: false },
    { id: "2", title: "Initialize new knowledge graph vector embeddings", completed: false },
    { id: "3", title: "Complete system teardown of old SaaS artifacts", completed: true },
    { id: "4", title: "Establish deep space color palette", completed: true },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="min-h-full w-full flex flex-col justify-start px-12 md:px-32 py-32 relative">
      
      <div className="max-w-4xl w-full mx-auto z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-16 font-medium"
        >
          Active Directives
        </motion.p>
        
        <div className="flex flex-col gap-12">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => toggleTask(task.id)}
              className="group cursor-pointer flex items-center gap-8"
            >
              <div className="relative flex items-center justify-center w-8 h-8">
                {/* Minimalist interactive node indicator */}
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-700",
                  task.completed ? "bg-white/20" : "bg-white group-hover:scale-150"
                )} />
                {task.completed && (
                  <div className="absolute inset-0 rounded-full border border-white/10 scale-150 animate-ping opacity-0" />
                )}
              </div>
              
              <div className="flex-1 relative">
                <h3 className={cn(
                  "text-2xl md:text-4xl font-light tracking-tight transition-all duration-700",
                  task.completed ? "text-white/20" : "text-white/80 group-hover:text-white"
                )}>
                  {task.title}
                </h3>
                {/* Organic strikethrough line */}
                <div 
                  className="absolute top-1/2 left-0 h-[1px] bg-white/30 transition-all duration-1000 ease-[0.16,1,0.3,1]"
                  style={{ width: task.completed ? "100%" : "0%" }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Input Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-32"
        >
          <input
            type="text"
            placeholder="Assign new directive..."
            className="w-full bg-transparent border-b border-white/[0.05] pb-4 text-xl font-light text-white outline-none placeholder:text-white/20 focus:border-white/30 transition-colors duration-700"
          />
        </motion.div>

      </div>

    </div>
  );
}
