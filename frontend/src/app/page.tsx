"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/workspaces");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Slow-moving deep atmospheric gradient core */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
        <div className="w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_#1a1f2b_0%,_transparent_60%)] blur-[100px] animate-pulse-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, filter: "blur(20px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center flex flex-col items-center"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8 font-medium">System Initialize</span>
        
        <h1 className="text-6xl md:text-9xl font-light tracking-tight text-white mb-12 leading-[1.1]">
          Antigravity <br />
          <span className="italic font-serif text-white/50">Core</span>
        </h1>

        <Link 
          href="/register"
          className="text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors duration-700 relative group"
        >
          <span>Enter Workspace</span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-700" />
        </Link>
      </motion.div>

    </div>
  );
}
