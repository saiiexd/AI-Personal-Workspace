"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/workspaces");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center text-center px-4"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          className="mb-8 p-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
        >
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
          AI Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-white">Workspace</span>
        </h1>
        
        <p className="text-xl text-neutral-400 max-w-2xl mb-12">
          An intelligent productivity operating system that connects your thoughts, tasks, and documents in one seamless experience.
        </p>
        
        <div className="flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/login")}
            className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-neutral-200 transition-colors"
          >
            Sign In
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/register")}
            className="px-8 py-3 bg-transparent text-white border border-white/20 font-medium rounded-full hover:bg-white/10 transition-colors"
          >
            Create Account
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
