"use client";

import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import Link from "next/link";

export default function WorkspacesPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-full w-full flex flex-col justify-center px-12 md:px-32 py-20">
      
      <div className="max-w-5xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-8 font-medium"
        >
          Node / {user?.firstName || "Operator"}
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-light tracking-tight text-white/90 leading-[1.1]"
        >
          Your cognitive <span className="italic font-serif text-white/40">atlas</span>
        </motion.h1>
      </div>

      <div className="mt-32 max-w-3xl flex flex-col gap-12">
        
        {/* Typographic Link Row 1 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/ai" className="group flex flex-col">
            <div className="flex items-baseline justify-between border-b border-white/[0.05] pb-4 mb-4 group-hover:border-white/20 transition-colors duration-700">
              <span className="text-3xl font-light text-white/50 group-hover:text-white transition-colors duration-700">Assistant</span>
              <span className="text-xs uppercase tracking-widest text-white/20 group-hover:text-white/50 transition-colors duration-700">Active</span>
            </div>
            <span className="text-sm text-white/30 font-light max-w-md">Engage with the intelligence core to process language and queries.</span>
          </Link>
        </motion.div>

        {/* Typographic Link Row 2 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/documents" className="group flex flex-col">
            <div className="flex items-baseline justify-between border-b border-white/[0.05] pb-4 mb-4 group-hover:border-white/20 transition-colors duration-700">
              <span className="text-3xl font-light text-white/50 group-hover:text-white transition-colors duration-700">Knowledge</span>
              <span className="text-xs uppercase tracking-widest text-white/20 group-hover:text-white/50 transition-colors duration-700">Vectors</span>
            </div>
            <span className="text-sm text-white/30 font-light max-w-md">Access your ingested documents, research, and technical literature.</span>
          </Link>
        </motion.div>

        {/* Typographic Link Row 3 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/tasks" className="group flex flex-col">
            <div className="flex items-baseline justify-between border-b border-white/[0.05] pb-4 mb-4 group-hover:border-white/20 transition-colors duration-700">
              <span className="text-3xl font-light text-white/50 group-hover:text-white transition-colors duration-700">Directives</span>
              <span className="text-xs uppercase tracking-widest text-white/20 group-hover:text-white/50 transition-colors duration-700">Pending</span>
            </div>
            <span className="text-sm text-white/30 font-light max-w-md">Track ongoing tasks and active system commands.</span>
          </Link>
        </motion.div>

      </div>

    </div>
  );
}
