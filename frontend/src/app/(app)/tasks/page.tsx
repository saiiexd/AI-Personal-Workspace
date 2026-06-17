"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Search, Calendar, Flag, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTasks, TaskStatus } from "@/hooks/use-tasks";
import { GradientArt } from "@/components/ui/gradient-art";

export default function TasksPage() {
  const { tasks, isLoading, createTask, updateTask } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [search, setSearch] = useState("");
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    await createTask.mutateAsync({
      title: newTaskTitle,
      status: "todo",
      priority: "medium",
    });
    setNewTaskTitle("");
  };

  const handleToggleStatus = async (taskId: string, currentStatus: TaskStatus) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    
    if (newStatus === "done") {
      setCompletedTaskIds(prev => new Set(prev).add(taskId));
      setTimeout(async () => {
        await updateTask.mutateAsync({ id: taskId, status: newStatus });
      }, 600);
    } else {
      setCompletedTaskIds(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      await updateTask.mutateAsync({ id: taskId, status: newStatus });
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) && t.status !== "done"
  );
  const doneTasks = tasks.filter(t => t.status === "done");

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col justify-between px-8 md:px-20 py-12 z-10 overflow-hidden">
      
      {/* Productivity Energy Streams Artwork */}
      <GradientArt type="tasks" />

      {/* Editorial Header */}
      <div className="max-w-4xl mt-12 md:mt-20 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs uppercase tracking-[0.3em] text-[#e0d7c7] mb-6 font-medium"
        >
          Workspace Momentum
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl font-light tracking-tight text-white mb-6 leading-none"
        >
          Directives & <span className="italic font-serif text-[#ebd7c8]">Momentum</span>
        </motion.h1>

        <p className="text-lg text-white/40 font-light leading-relaxed max-w-2xl mb-12">
          Your active directives drive momentum. Keep the cognitive flow high by completing active items and reviewing your progress.
        </p>

        {/* Action Dock (Search + Create) */}
        <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
          <form onSubmit={handleCreateTask} className="flex-1 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ebd7c8]/20 to-[#ebd0a0]/20 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500" />
            <div className="relative flex items-center bg-white/[0.02] border border-white/5 rounded-full px-6 py-1">
              <Input 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Initialize a new directive..."
                className="flex-1 bg-transparent border-none text-white placeholder:text-white/20 focus-visible:ring-0 text-sm h-12"
              />
              <button 
                type="submit"
                disabled={!newTaskTitle.trim() || createTask.isPending}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-[#ebd7c8] hover:bg-white hover:text-black transition-all flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="w-full md:w-64 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-12 bg-white/[0.02] border-white/5 h-14 rounded-full text-xs placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/10"
            />
          </div>
        </div>
      </div>

      {/* Directives Stream */}
      <div className="relative z-10 mt-20 max-w-3xl space-y-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="text-white/30 py-10">
              <p className="text-xs uppercase tracking-widest font-mono">Loading directives...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 py-12 text-[#c8dad1]"
            >
              <Sparkles className="w-5 h-5 text-current animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-mono">No active directives. Platform is optimized.</span>
            </motion.div>
          ) : (
            filteredTasks.map((task, i) => {
              const isExploding = completedTaskIds.has(task.id);
              
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={isExploding ? { 
                    x: "10%", 
                    opacity: 0, 
                    filter: "blur(6px)"
                  } : { 
                    opacity: 1, 
                    y: 0,
                    filter: "blur(0px)" 
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 20, 
                    delay: isExploding ? 0 : i * 0.04
                  }}
                  className="group relative flex items-center justify-between py-5 border-b border-white/5 hover:border-white/20 transition-all duration-500"
                >
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <button 
                      onClick={() => handleToggleStatus(task.id, task.status as TaskStatus)}
                      className="w-7 h-7 rounded-full border border-white/20 hover:border-[#ebd7c8] flex items-center justify-center bg-black/20 group-hover:scale-105 transition-all"
                    >
                      <Check className="w-3.5 h-3.5 text-[#ebd7c8] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-lg text-white group-hover:text-[#ebd7c8] transition-colors duration-500 truncate">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1.5 text-[9px] text-white/30 font-mono tracking-widest uppercase">
                        {task.priority && (
                          <span className="flex items-center gap-1 text-[#ebd7c8]/60">
                            <Flag className="w-3 h-3 text-[#ebd7c8]" />
                            {task.priority}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Done Directives Summary */}
      {doneTasks.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 border-t border-white/5 mt-20 pt-12 pb-32 max-w-3xl"
        >
          <h3 className="text-white/30 uppercase tracking-[0.25em] text-[10px] mb-6">Completed Directives</h3>
          <div className="flex flex-wrap gap-3">
            {doneTasks.slice(0, 8).map(task => (
              <div key={task.id} className="px-4 py-2 rounded-full bg-white/[0.01] border border-white/5 text-xs text-white/30 line-through">
                {task.title}
              </div>
            ))}
            {doneTasks.length > 8 && (
              <div className="px-4 py-2 rounded-full bg-white/[0.01] border border-white/5 text-xs text-white/30">
                +{doneTasks.length - 8} more
              </div>
            )}
          </div>
        </motion.div>
      )}

    </div>
  );
}
