"use client";

import { useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { useTasks, TaskStatus } from "@/hooks/use-tasks";
import { CheckCircle2, Circle, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TasksPage() {
  const { tasks, isLoading, createTask, updateTask } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await createTask.mutateAsync({
        title: newTaskTitle,
        priority: "medium",
        status: "todo",
      });
      setNewTaskTitle("");
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const toggleTaskStatus = async (id: string, currentStatus: TaskStatus) => {
    const newStatus: TaskStatus = currentStatus === "done" ? "todo" : "done";
    await updateTask.mutateAsync({ id, status: newStatus });
  };

  return (
    <PageTransition className="pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Typography variant="h1" className="mb-2">Tasks</Typography>
            <Typography variant="muted">Manage your action items and track momentum.</Typography>
          </div>
          <Button onClick={() => setIsAdding(true)} className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Task Form */}
        {isAdding && (
          <form onSubmit={handleCreateTask} className="mb-6 p-4 border border-border rounded-xl bg-card">
            <input
              type="text"
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-transparent border-none text-foreground focus:outline-none focus:ring-0 text-lg mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" disabled={!newTaskTitle.trim() || createTask.isPending}>
                {createTask.isPending ? "Adding..." : "Save Task"}
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground animate-pulse">Loading tasks...</div>
        ) : tasks.length === 0 && !isAdding ? (
          <div className="text-center py-24 border border-dashed border-border rounded-xl">
            <Typography variant="muted" className="mb-4">No tasks yet.</Typography>
            <Button variant="outline" onClick={() => setIsAdding(true)}>Create your first task</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  task.status === "done" 
                    ? "bg-card/50 border-transparent opacity-60" 
                    : "bg-card border-border hover:border-foreground/20 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {task.status === "done" ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Circle className="w-6 h-6" />}
                  </button>
                  <div>
                    <h3 className={`text-base font-medium transition-colors ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {task.status !== "done" && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                      task.priority === "high" ? "bg-destructive/10 text-destructive" :
                      task.priority === "medium" ? "bg-orange-500/10 text-orange-500" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {task.priority}
                    </span>
                  )}
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
