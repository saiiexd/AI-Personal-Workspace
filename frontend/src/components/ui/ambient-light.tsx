"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface AmbientLightProps {
  className?: string;
  color?: string;
  size?: number;
  followCursor?: boolean;
}

export function AmbientLight({ 
  className, 
  color = "rgba(120, 119, 198, 0.15)", 
  size = 600,
  followCursor = true
}: AmbientLightProps) {
  const [mounted, setMounted] = useState(false);
  
  // Create smooth physics-based motion values for the cursor
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Apply spring physics for that cinematic, fluid lag
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20, mass: 0.5 });

  useEffect(() => {
    setMounted(true);
    if (!followCursor) return;

    // Start at center of screen initially
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [followCursor, mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className={cn("absolute rounded-full blur-[120px] mix-blend-screen", className)}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          ...(followCursor ? {
            left: springX,
            top: springY,
            x: "-50%",
            y: "-50%",
          } : {})
        }}
      />
    </div>
  );
}
