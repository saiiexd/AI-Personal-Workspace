"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  FolderOpen, 
  Settings, 
  Bot,
  ChevronDown,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaces } from "@/hooks/use-workspaces";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/workspaces", icon: LayoutDashboard },
  { name: "Notes", href: "/notes", icon: FileText },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "AI Assistant", href: "/ai", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const { workspaces, currentWorkspace, selectWorkspace, createWorkspace } = useWorkspaces();

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    const slug = newWorkspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await createWorkspace.mutateAsync({ name: newWorkspaceName, slug });
    setNewWorkspaceName("");
    setIsWorkspaceOpen(false);
  };

  return (
    <div className="w-64 border-r bg-zinc-950/50 flex flex-col h-full text-zinc-300 relative">
      {/* Workspace Selector Area */}
      <div 
        onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
        className="h-14 flex items-center px-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group select-none"
      >
        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs mr-3">
          {currentWorkspace?.name?.[0] || "W"}
        </div>
        <span className="font-medium flex-1 truncate text-sm text-zinc-100">
          {currentWorkspace?.name || "Loading..."}
        </span>
        <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
      </div>

      {/* Workspace Selector Popover */}
      <AnimatePresence>
        {isWorkspaceOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-4 right-4 top-14 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 p-2 space-y-1"
          >
            <div className="text-xs font-semibold text-zinc-500 px-2 py-1 uppercase tracking-wider">
              Switch Workspace
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {workspaces.map((w) => (
                <div
                  key={w.id}
                  onClick={() => {
                    selectWorkspace(w);
                    setIsWorkspaceOpen(false);
                  }}
                  className={cn(
                    "flex items-center px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors",
                    currentWorkspace?.id === w.id 
                      ? "bg-primary/20 text-primary font-medium" 
                      : "hover:bg-white/5 text-zinc-300 hover:text-zinc-100"
                  )}
                >
                  <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center text-[10px] mr-2">
                    {w.name[0]}
                  </div>
                  <span className="truncate">{w.name}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/5 my-1 pt-1" />
            <form onSubmit={handleCreateWorkspace} className="flex gap-1 p-1">
              <input
                type="text"
                placeholder="New Workspace..."
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-primary"
              />
              <button 
                type="submit"
                className="bg-primary hover:bg-primary/80 text-primary-foreground p-1 rounded transition-colors"
                title="Create Workspace"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <span
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm transition-all group relative",
                  isActive 
                    ? "text-zinc-100 bg-white/10 font-medium" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 mr-3", isActive ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300")} />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Area */}
      <div className="p-4 border-t border-white/5">
        <Link href="/settings">
          <span className="flex items-center px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors group">
            <Settings className="w-4 h-4 mr-3 text-zinc-500 group-hover:text-zinc-300" />
            Settings
          </span>
        </Link>
      </div>
    </div>
  );
}
