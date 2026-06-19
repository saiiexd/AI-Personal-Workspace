/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { typographyReveal } from "@/lib/animations";

type TypographyVariant = 
  | "display" 
  | "h1" 
  | "h2" 
  | "h3" 
  | "h4" 
  | "lead" 
  | "p" 
  | "large" 
  | "small" 
  | "muted";

interface TypographyProps extends HTMLMotionProps<"div"> {
  variant?: TypographyVariant;
  gradient?: boolean;
  animate?: boolean;
  as?: React.ElementType;
}

export function Typography({
  variant = "p",
  gradient = false,
  animate = true,
  className,
  children,
  as,
  ...props
}: TypographyProps) {
  const baseStyles = "text-foreground";
  
  const variants: Record<TypographyVariant, string> = {
    display: "scroll-m-20 text-6xl font-extrabold tracking-cinematic lg:text-8xl font-display",
    h1: "scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl font-display",
    h2: "scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 font-display",
    h3: "scroll-m-20 text-2xl font-semibold tracking-tight font-display",
    h4: "scroll-m-20 text-xl font-semibold tracking-tight font-display",
    lead: "text-xl text-muted-foreground",
    p: "leading-7 [&:not(:first-child)]:mt-6",
    large: "text-lg font-semibold",
    small: "text-sm font-medium leading-none",
    muted: "text-sm text-muted-foreground",
  };

  const gradientStyles = gradient ? "text-gradient" : "";

  // Map common tags for accessibility if 'as' is not provided and it's a heading
  const MotionTag = as || (["h1", "h2", "h3", "h4"].includes(variant) 
    ? (motion as any)[variant] 
    : motion.p);

  return (
    <MotionTag
      variants={animate ? typographyReveal : undefined}
      className={cn(baseStyles, variants[variant], gradientStyles, className)}
      {...(props as any)}
    >
      {children}
    </MotionTag>
  );
}
