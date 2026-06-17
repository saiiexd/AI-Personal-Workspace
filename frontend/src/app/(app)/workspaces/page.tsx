"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckSquare, BrainCircuit, Activity, FolderOpen } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { useTasks } from "@/hooks/use-tasks";
import { useDocuments } from "@/hooks/use-documents";
import { useAI } from "@/hooks/use-ai";
import Link from "next/link";

export default function WorkspacesPage() {
  const { notes, isLoading: isNotesLoading } = useNotes();
  const { tasks, isLoading: isTasksLoading } = useTasks();
  const { documents, isLoading: isDocsLoading } = useDocuments();
  const { conversations } = useAI();

  const totalNotes = notes.length;
  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const totalDocs = documents.length;
  const totalAIConvs = conversations.length;

  const recentNotes = notes.slice(0, 3);
  const recentDocs = documents.slice(0, 3);
  const openTasksList = tasks.filter((t) => t.status !== "done").slice(0, 3);

  const isLoading = isNotesLoading || isTasksLoading || isDocsLoading;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your personal workspace activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Notes" 
          value={isLoading ? "..." : String(totalNotes)} 
          icon={<FileText className="w-4 h-4 text-blue-500" />} 
          trend="Saved thoughts" 
        />
        <StatCard 
          title="Active Tasks" 
          value={isLoading ? "..." : String(activeTasks)} 
          icon={<CheckSquare className="w-4 h-4 text-emerald-500" />} 
          trend="Awaiting action" 
        />
        <StatCard 
          title="Documents" 
          value={isLoading ? "..." : String(totalDocs)} 
          icon={<FolderOpen className="w-4 h-4 text-purple-500" />} 
          trend="Knowledge base files" 
        />
        <StatCard 
          title="AI Chats" 
          value={isLoading ? "..." : String(totalAIConvs)} 
          icon={<BrainCircuit className="w-4 h-4 text-amber-500" />} 
          trend="Contextual helper threads" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Recent Notes</CardTitle>
              <CardDescription>Your latest captured thoughts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-zinc-500 text-sm">Loading activity...</div>
                ) : recentNotes.length === 0 ? (
                  <div className="text-zinc-500 text-sm">No notes found. Create your first note from the sidebar.</div>
                ) : (
                  recentNotes.map((note) => (
                    <Link href="/notes" key={note.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate text-zinc-100">{note.title}</h4>
                        <p className="text-xs text-muted-foreground">Edited {new Date(note.updated_at).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Latest files uploaded.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-zinc-500 text-sm">Loading activity...</div>
                ) : recentDocs.length === 0 ? (
                  <div className="text-zinc-500 text-sm">No documents found. Upload files in Documents view.</div>
                ) : (
                  recentDocs.map((doc) => (
                    <Link href="/documents" key={doc.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate text-zinc-100">{doc.title}</h4>
                        <p className="text-xs text-muted-foreground">{doc.file_type.toUpperCase()} • {(doc.size_bytes / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Open Tasks</CardTitle>
              <CardDescription>Tasks requiring immediate attention.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-zinc-500 text-sm">Loading tasks...</div>
                ) : openTasksList.length === 0 ? (
                  <div className="text-zinc-500 text-sm">All tasks are completed!</div>
                ) : (
                  openTasksList.map((task) => (
                    <Link href="/tasks" key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                      <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <span className="text-sm text-zinc-200 truncate flex-1">{task.title}</span>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm">
                <p className="text-purple-200">
                  <strong className="text-purple-100">Quick Tip:</strong> Use the AI Assistant to query your workspace files semantically without needing to search manually.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="bg-white/5 border-white/10 overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 scale-150 transform translate-x-1/4 -translate-y-1/4">
          {icon}
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {trend}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
