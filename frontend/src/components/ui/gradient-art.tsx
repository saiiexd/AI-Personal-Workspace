"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientArtProps {
  type: "intelligence" | "ai" | "notes" | "tasks" | "documents" | "settings";
  className?: string;
}

const PALETTES = {
  intelligence: [
    "bg-[radial-gradient(circle_at_30%_20%,#e0d7c7_0%,transparent_50%)]", // cream
    "bg-[radial-gradient(circle_at_70%_60%,#b8c2d1_0%,transparent_50%)]", // soft blue
    "bg-[radial-gradient(circle_at_40%_80%,#dcd1eb_0%,transparent_40%)]", // lavender
    "bg-[radial-gradient(circle_at_80%_20%,#ebd7c8_0%,transparent_45%)]", // peach
  ],
  ai: [
    "bg-[radial-gradient(circle_at_20%_30%,#dcd1eb_0%,transparent_50%)]", // lavender
    "bg-[radial-gradient(circle_at_80%_70%,#b8c2d1_0%,transparent_55%)]", // soft blue
    "bg-[radial-gradient(circle_at_50%_10%,#fdfbf7_0%,transparent_40%)]", // cloud white/cream
    "bg-[radial-gradient(circle_at_30%_90%,#e6cabc_0%,transparent_45%)]", // warm peach/gold
  ],
  notes: [
    "bg-[radial-gradient(circle_at_10%_40%,#b8c2d1_0%,transparent_60%)]", // soft blue
    "bg-[radial-gradient(circle_at_80%_30%,#c8dad1_0%,transparent_50%)]", // sage green
    "bg-[radial-gradient(circle_at_60%_80%,#e0d7c7_0%,transparent_45%)]", // cream
  ],
  tasks: [
    "bg-[radial-gradient(circle_at_40%_20%,#ebd7c8_0%,transparent_55%)]", // peach
    "bg-[radial-gradient(circle_at_75%_50%,#ebd0a0_0%,transparent_50%)]", // warm gold
    "bg-[radial-gradient(circle_at_20%_70%,#dcd1eb_0%,transparent_45%)]", // lavender
  ],
  documents: [
    "bg-[radial-gradient(circle_at_30%_30%,#c7d5e0_0%,transparent_50%)]", // powder blue
    "bg-[radial-gradient(circle_at_70%_70%,#dcd1eb_0%,transparent_50%)]", // lavender
    "bg-[radial-gradient(circle_at_50%_40%,#e0d7c7_0%,transparent_40%)]", // cream
  ],
  settings: [
    "bg-[radial-gradient(circle_at_50%_30%,#c8dad1_0%,transparent_55%)]", // sage green
    "bg-[radial-gradient(circle_at_20%_60%,#e0d7c7_0%,transparent_45%)]", // cream
    "bg-[radial-gradient(circle_at_80%_80%,#b8c2d1_0%,transparent_50%)]", // soft blue
  ],
};

export function GradientArt({ type, className }: GradientArtProps) {
  const blobs = PALETTES[type] || PALETTES.intelligence;

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none select-none z-0", className)}>
      {/* Mesh Gradient Container with Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.14] mix-blend-screen blur-[130px] filter saturate-[1.2]">
        {blobs.map((blobClass, index) => (
          <motion.div
            key={index}
            className={cn("absolute inset-0 w-[120%] h-[120%]", blobClass)}
            animate={{
              x: [
                index % 2 === 0 ? -40 : 40,
                index % 2 === 0 ? 40 : -40,
                index % 2 === 0 ? -40 : 40,
              ],
              y: [
                index % 3 === 0 ? -30 : 30,
                index % 3 === 0 ? 30 : -30,
                index % 3 === 0 ? -30 : 30,
              ],
              scale: [1, 1.15, 0.95, 1],
              rotate: [0, 45, -45, 0],
            }}
            transition={{
              duration: 25 + index * 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Atmospheric Soft Light Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505]/90 pointer-events-none" />

      {/* Fine-grained Noise Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
