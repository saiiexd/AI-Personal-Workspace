"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MeshGradientProps {
  className?: string;
  colors?: [string, string, string, string];
  animate?: boolean;
}

export function MeshGradient({ 
  className, 
  colors = ["from-indigo-500/20", "via-purple-500/20", "to-cyan-500/20", "bg-blue-500/10"],
  animate = true
}: MeshGradientProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-[-1]", className)}>
      <motion.div
        animate={animate ? {
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 5, -5, 0],
        } : {}}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute -top-[25%] -left-[25%] w-[150%] h-[150%] rounded-full mix-blend-screen blur-[120px] opacity-40",
          "bg-gradient-to-br",
          colors[0],
          colors[1],
          colors[2]
        )}
      />
      <motion.div
        animate={animate ? {
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
        } : {}}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute top-[20%] right-[10%] w-[80%] h-[80%] rounded-full mix-blend-screen blur-[100px] opacity-30",
          colors[3]
        )}
      />
    </div>
  );
}
