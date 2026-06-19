"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, ShieldCheck, Zap } from "lucide-react";

const steps = [
  {
    id: "welcome",
    title: "Neural Core Initialized",
    description: "Welcome to your new cognitive architecture. We are preparing the semantic environment for your knowledge.",
    icon: BrainCircuit,
  },
  {
    id: "encryption",
    title: "Securing Pathways",
    description: "Establishing end-to-end encryption for your personal intelligence base. Your data remains yours.",
    icon: ShieldCheck,
  },
  {
    id: "ready",
    title: "System Ready",
    description: "Your workspace is fully calibrated. The intelligence engine is waiting for your first directive.",
    icon: Zap,
  }
];

export default function OnboardingExperience() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      router.push("/workspaces");
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <PageTransition className="min-h-screen bg-background relative flex flex-col items-center justify-center overflow-hidden">
      <MeshGradient className="opacity-40" />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl px-8 flex flex-col items-center text-center">
        
        <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-12 shadow-[0_0_50px_-10px_var(--color-primary)] relative">
          <div className="absolute inset-0 rounded-full border border-primary border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepIcon className="w-10 h-10 text-white" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="h-40 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Typography variant="h2" className="mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                {steps[currentStep].title}
              </Typography>
              <Typography variant="lead" className="max-w-md mx-auto">
                {steps[currentStep].description}
              </Typography>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex flex-col items-center gap-8 w-full">
          <div className="flex gap-3">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-700 ${i === currentStep ? "w-8 bg-primary" : i < currentStep ? "w-4 bg-white/30" : "w-4 bg-white/10"}`} 
              />
            ))}
          </div>
          
          <Button 
            size="lg" 
            onClick={nextStep}
            className="rounded-full px-12 h-14 bg-white text-black hover:bg-white/90 group w-full sm:w-auto"
          >
            {currentStep === steps.length - 1 ? "Enter Workspace" : "Continue"}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

      </div>
    </PageTransition>
  );
}
