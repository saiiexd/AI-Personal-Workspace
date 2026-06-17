"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Search, Calendar, Flag, AlertCircle, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTasks, TaskStatus, TaskPriority } from "@/hooks/use-tasks";

export default function TasksPage() {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [isAdding, setIsAdding] = useState(false);

  // Filter criteria passed to backend or handled on client side
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks(
    filterStatus !== "all" ? { status: filterStatus } : undefined
  );

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await createTask.mutateAsync({
      title: newTaskTitle,
      status: "todo",
      priority: newTaskPriority,
      due_date: new Date(Date.now() + 86400000).toISOString(), // Default: Tomorrow
    });

    setNewTaskTitle("");
    setIsAdding(false);
  };

  const handleToggleTask = async (id: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === "done" ? "todo" : "done";
    await updateTask.mutateAsync({
      id,
      status: nextStatus,
    });
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm("Delete this task?")) {
      await deleteTask.mutateAsync(id);
    }
  };

  // Client side filtering for query
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your actionable items.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleCreateTask}
          className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4"
        >
          <div className="flex gap-4">
            <Input
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="bg-zinc-950/50 border-white/10"
              required
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
              className="bg-zinc-950 border border-white/10 rounded-lg px-3 text-sm text-zinc-300 focus:outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <Button type="submit">Add Task</Button>
          </div>
        </motion.form>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-zinc-900/50 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-zinc-950/50 border-white/10 h-9" 
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={filterStatus === "all" ? "outline" : "ghost"} 
              size="sm" 
              onClick={() => setFilterStatus("all")}
              className="h-9"
            >
              All
            </Button>
            <Button 
              variant={filterStatus === "todo" ? "outline" : "ghost"} 
              size="sm" 
              onClick={() => setFilterStatus("todo")}
              className="h-9"
            >
              To Do
            </Button>
            <Button 
              variant={filterStatus === "in_progress" ? "outline" : "ghost"} 
              size="sm" 
              onClick={() => setFilterStatus("in_progress")}
              className="h-9"
            >
              In Progress
            </Button>
            <Button 
              variant={filterStatus === "done" ? "outline" : "ghost"} 
              size="sm" 
              onClick={() => setFilterStatus("done")}
              className="h-9"
            >
              Completed
            </Button>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No tasks found.</div>
          ) : (
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex items-center p-4 gap-4 transition-colors hover:bg-white/5 ${task.status === 'done' ? 'opacity-60' : ''}`}
                >
                  <button 
                    onClick={() => handleToggleTask(task.id, task.status)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      task.status === 'done' 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {task.status === 'done' && <Check className="w-3 h-3" />}
                  </button>
                  
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                      {task.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {task.priority === 'high' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                    {task.priority === 'medium' && <Flag className="w-4 h-4 text-amber-500" />}
                    {task.due_date && (
                      <span className="flex items-center text-xs text-zinc-500 font-medium">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    )}
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
