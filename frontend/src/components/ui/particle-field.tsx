"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface ParticleFieldProps {
  className?: string;
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
}

export function ParticleField({
  className,
  count = 30,
  color = "bg-white",
  minSize = 1,
  maxSize = 3,
}: ParticleFieldProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * 100, // percentage
      size: Math.random() * (maxSize - minSize) + minSize,
      duration: Math.random() * 20 + 10, // 10-30 seconds
      delay: Math.random() * -20, // Start at different phases
      opacity: Math.random() * 0.3 + 0.1, // 0.1 - 0.4
    }));
    setParticles(newParticles);
  }, [count, minSize, maxSize]);

  if (!mounted) return null;

  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none z-0", className)}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${color}`}
          initial={{
            x: `${p.x}vw`,
            y: `${p.y}vh`,
            opacity: p.opacity,
            scale: 1,
          }}
          animate={{
            y: [`${p.y}vh`, `${p.y - 20}vh`, `${p.y}vh`],
            x: [`${p.x}vw`, `${p.x + 10}vw`, `${p.x}vw`],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
          style={{
            width: p.size,
            height: p.size,
            willChange: "transform, opacity"
          }}
        />
      ))}
    </div>
  );
}
