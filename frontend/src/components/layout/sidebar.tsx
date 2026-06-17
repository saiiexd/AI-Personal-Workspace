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
  Plus,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaces } from "@/hooks/use-workspaces";

const NAV_ITEMS = [
  { name: "Mission Control", href: "/workspaces", icon: LayoutDashboard },
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
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 h-[calc(100vh-2rem)] my-4 ml-4 mr-2 rounded-2xl glass-panel flex flex-col relative overflow-visible flex-shrink-0 z-50 border-white/5 shadow-2xl"
    >
      {/* Dynamic Blur Background Layer */}
      <div className="absolute inset-0 bg-sidebar/80 rounded-2xl backdrop-blur-2xl z-[-1]" />
      
      {/* Workspace Selector Area */}
      <div 
        onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
        className="h-16 flex items-center px-4 border-b border-border/40 cursor-pointer hover:bg-white/5 transition-colors group select-none relative z-20 rounded-t-2xl"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm mr-3 glow-hover group-hover:bg-primary/30 transition-all shadow-[0_0_15px_-3px_hsl(var(--primary)/0.3)]">
          {currentWorkspace?.name?.[0] || "W"}
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Workspace</span>
          <span className="font-medium truncate text-sm text-foreground">
            {currentWorkspace?.name || "Loading..."}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isWorkspaceOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.div>
      </div>

      {/* Workspace Selector Popover */}
      <AnimatePresence>
        {isWorkspaceOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute left-2 right-2 top-16 mt-2 glass-panel bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] z-50 p-2 space-y-1 overflow-hidden"
          >
            <div className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">
              Switch Workspace
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {workspaces.map((w) => (
                <motion.div
                  whileHover={{ scale: 0.98, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  key={w.id}
                  onClick={() => {
                    selectWorkspace(w);
                    setIsWorkspaceOpen(false);
                  }}
                  className={cn(
                    "flex items-center px-2 py-2 rounded-lg text-sm cursor-pointer transition-colors relative group",
                    currentWorkspace?.id === w.id 
                      ? "text-primary font-medium" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {currentWorkspace?.id === w.id && (
                    <motion.div 
                      layoutId="workspace-active"
                      className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg -z-10"
                    />
                  )}
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center text-[10px] mr-3 transition-colors font-bold",
                    currentWorkspace?.id === w.id ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted text-muted-foreground group-hover:bg-muted/80 border border-white/5"
                  )}>
                    {w.name[0]}
                  </div>
                  <span className="truncate">{w.name}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="border-t border-border/40 my-2 pt-2 px-1">
              <form onSubmit={handleCreateWorkspace} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Workspace..."
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="flex-1 glass-input bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none"
                />
                <button 
                  type="submit"
                  className="bg-primary/90 hover:bg-primary text-primary-foreground w-7 h-7 flex items-center justify-center rounded-md transition-colors glow-hover"
                  title="Create Workspace"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 relative z-20 custom-scrollbar">
        <div className="text-[10px] font-bold text-muted-foreground px-3 mb-2 uppercase tracking-wider">Overview</div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/workspaces" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href} className="block relative">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-xl text-sm transition-colors group relative z-10",
                  isActive 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Glowing dot for active state */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-full glow-primary"
                    />
                  )}
                </AnimatePresence>
                
                <Icon className={cn(
                  "w-4 h-4 mr-3 transition-colors", 
                  isActive ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {item.name}
                
                {item.name === "AI Assistant" && (
                  <Sparkles className="w-3 h-3 ml-auto text-primary animate-pulse-slow drop-shadow-[0_0_5px_rgba(var(--primary),1)]" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Area */}
      <div className="p-4 border-t border-border/40 relative z-20">
        <Link href="/settings" className="block relative">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground bg-black/20 border border-white/5 hover:border-white/10 rounded-xl transition-all group shadow-inner"
          >
            <Settings className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-foreground transition-all group-hover:rotate-45" />
            Workspace Settings
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
