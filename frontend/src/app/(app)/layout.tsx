"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ParticleField } from "@/components/ui/particle-field";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/workspaces", label: "Intelligence" },
  { href: "/ai", label: "Assistant" },
  { href: "/documents", label: "Knowledge" },
  { href: "/notes", label: "Memory" },
  { href: "/tasks", label: "Directives" },
  { href: "/search", label: "Discovery" },
  { href: "/settings", label: "System" },
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
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground relative">
      
      {/* Deep Space Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.02] via-transparent to-transparent pointer-events-none" />
      <ParticleField count={15} color="bg-white/10" minSize={1} maxSize={1.5} />
      
      {/* Edge-to-edge content area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-full w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Minimalist Floating Navigation Anchor - No Dock, No Cards */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-8 py-3 rounded-full bg-white/[0.01] border border-white/[0.05] backdrop-blur-2xl"
      >
        <Link href="/workspaces" className="text-white/20 hover:text-white transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
        </Link>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "text-[10px] uppercase tracking-widest transition-all duration-700 font-medium",
                isActive ? "text-white" : "text-white/30 hover:text-white/70"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </motion.div>

    </div>
  );
}
