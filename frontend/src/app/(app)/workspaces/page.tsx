"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { useTasks } from "@/hooks/use-tasks";
import { useNotes } from "@/hooks/use-notes";
import { useDocuments } from "@/hooks/use-documents";
import { CheckCircle2, Clock, FileText, Database, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { tasks, total: totalTasks, isLoading: isTasksLoading } = useTasks();
  const { notes, isLoading: isNotesLoading } = useNotes();
  const { total: totalDocs, isLoading: isDocsLoading } = useDocuments();

  const pendingTasks = tasks.filter(t => t.status !== "done").slice(0, 3);
  const recentNotes = notes.slice(0, 3);

  const isLoading = isTasksLoading || isNotesLoading || isDocsLoading;

  return (
    <PageTransition className="pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <Typography variant="h1" className="mb-2">Dashboard</Typography>
          <Typography variant="muted" className="max-w-2xl">
            Overview of your active tasks, recent notes, and knowledge base.
          </Typography>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Tasks</h3>
            </div>
            <p className="text-3xl font-bold">{isLoading ? "-" : totalTasks}</p>
            <p className="text-sm text-muted-foreground mt-1">Total pending and completed</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-orange-400" />
              <h3 className="font-medium text-foreground">Notes</h3>
            </div>
            <p className="text-3xl font-bold">{isLoading ? "-" : notes.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Captured thoughts & ideas</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium text-foreground">Documents</h3>
            </div>
            <p className="text-3xl font-bold">{isLoading ? "-" : totalDocs}</p>
            <p className="text-sm text-muted-foreground mt-1">Uploaded to knowledge base</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <Typography variant="h3">Pending Tasks</Typography>
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            {isTasksLoading ? (
              <div className="text-sm text-muted-foreground animate-pulse">Loading tasks...</div>
            ) : pendingTasks.length === 0 ? (
              <div className="p-6 border border-dashed border-border rounded-xl text-center">
                <p className="text-sm text-muted-foreground mb-3">No pending tasks.</p>
                <Link href="/tasks"><Button size="sm" variant="outline">Create a task</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <div key={task.id} className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <span className={`text-xs px-2 py-0.5 mt-2 inline-block rounded-md ${
                          task.priority === "high" ? "bg-destructive/10 text-destructive" :
                          task.priority === "medium" ? "bg-orange-500/10 text-orange-500" :
                          "bg-muted text-muted-foreground"
                        }`}>{task.priority}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Notes Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <Typography variant="h3">Recent Notes</Typography>
              <Link href="/notes">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            {isNotesLoading ? (
              <div className="text-sm text-muted-foreground animate-pulse">Loading notes...</div>
            ) : recentNotes.length === 0 ? (
              <div className="p-6 border border-dashed border-border rounded-xl text-center">
                <p className="text-sm text-muted-foreground mb-3">No notes created.</p>
                <Link href="/notes"><Button size="sm" variant="outline">Write a note</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotes.map(note => (
                  <div key={note.id} className="p-4 rounded-xl border border-border bg-card hover:border-orange-500/30 transition-colors">
                    <h4 className="font-medium text-foreground mb-1">{note.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
