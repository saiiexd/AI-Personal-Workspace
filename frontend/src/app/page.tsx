"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/workspaces");
    }
  }, [isAuthenticated, router]);

  return (
    <PageTransition className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      <AnimatedBackground />
      <MeshGradient className="opacity-50" />
      
      <div className="relative z-10 w-full max-w-5xl px-6 mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm font-medium text-white/70 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            System Online
          </div>
        </motion.div>

        <Typography variant="display" className="mb-6 mx-auto max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
          The Intelligence <br /> Operating System
        </Typography>

        <Typography variant="lead" className="mb-12 max-w-2xl mx-auto text-white/60 font-light">
          A beautifully engineered environment where your knowledge, tasks, and ideas converge into a singular AI-native product experience.
        </Typography>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Button asChild size="lg" className="rounded-full px-8 h-14 text-base group">
            <Link href="/register">
              Initialize Workspace
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="glass" size="lg" className="rounded-full px-8 h-14 text-base">
            <Link href="/login">Authenticate</Link>
          </Button>
        </motion.div>
      </div>
    </PageTransition>
  );
}
