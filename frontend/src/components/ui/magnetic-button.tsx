"use client";

import { useRef, useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  intensity?: number;
  glowColor?: string;
}

export function MagneticButton({ 
  children, 
  className, 
  intensity = 0.5,
  glowColor = "rgba(255,255,255,0.1)",
  ...props 
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const { clientX, clientY } = e;
    const { height, width, left, top } = buttonRef.current.getBoundingClientRect();
    
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    setPosition({ x: middleX * intensity, y: middleY * intensity });
  };

  const reset = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={cn(
        "relative overflow-hidden transition-colors duration-300",
        className
      )}
      {...props}
    >
      {/* Interactive Glow Layer */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
          x: position.x * 2,
          y: position.y * 2,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      />
      
      <span className="relative z-10 flex items-center justify-center">
        {children as React.ReactNode}
      </span>
    </motion.button>
  );
}
