"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Command } from "lucide-react";

const NAV_ITEMS = [
  { href: "/workspaces", label: "Dashboard" },
  { href: "/ai", label: "AI Chat" },
  { href: "/notes", label: "Notes" },
  { href: "/documents", label: "Documents" },
  { href: "/tasks", label: "Tasks" },
  { href: "/search", label: "Search" },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      if (!useAuthStore.getState().isAuthenticated) {
        router.push("/login");
      }
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !useAuthStore.getState().isAuthenticated) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/workspaces" className="flex items-center space-x-2">
              <Command className="h-5 w-5" />
              <span className="font-bold inline-block font-display">Workspace</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "transition-colors hover:text-foreground/80 text-sm font-medium",
                      isActive ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-sm font-medium text-foreground/60 hover:text-foreground">
              Settings
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center cursor-pointer">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
