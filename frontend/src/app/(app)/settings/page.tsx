"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { motion } from "framer-motion";
import { staggerContainer, itemVariants } from "@/lib/animations";
import { User, Shield, Palette, Zap, Globe } from "lucide-react";

export default function PreferencesEnvironment() {
  const sections = [
    { id: "account", icon: User, title: "Identity & Core", description: "Manage your personal intelligence profile." },
    { id: "appearance", icon: Palette, title: "Environment", description: "Shape the visual and atmospheric behavior of your workspace." },
    { id: "ai", icon: Zap, title: "Intelligence Engine", description: "Configure model behavior, memory retention, and context windows." },
    { id: "security", icon: Shield, title: "Privacy & Encryption", description: "Control how your knowledge is secured and processed." },
    { id: "sync", icon: Globe, title: "Synchronization", description: "Manage cross-device knowledge consistency." },
  ];

  return (
    <PageTransition className="min-h-screen bg-background relative pb-24">
      <div className="max-w-5xl mx-auto px-8 pt-24 grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* Navigation Column */}
        <div className="md:col-span-4 lg:col-span-3">
          <Typography variant="h3" className="mb-8">Preferences</Typography>
          <nav className="space-y-2">
            {sections.map((section, i) => (
              <button 
                key={section.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                  i === 0 
                    ? "bg-white/10 text-white font-medium shadow-[0_0_20px_-10px_rgba(255,255,255,0.3)]" 
                    : "text-white/50 hover:bg-white/[0.05] hover:text-white/80"
                }`}
              >
                <section.icon className="w-4 h-4 shrink-0" />
                <span className="text-sm">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Column */}
        <div className="md:col-span-8 lg:col-span-9">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="pt-2">
            <motion.div variants={itemVariants} className="mb-12">
              <Typography variant="h2" className="mb-2">Identity & Core</Typography>
              <Typography variant="muted">Manage your personal intelligence profile and fundamental workspace settings.</Typography>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-8">
              
              {/* Profile Card */}
              <div className="glass-panel rounded-3xl p-8 flex items-center gap-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                  <div className="w-full h-full bg-background rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10" />
                    <User className="w-10 h-10 text-white/80 relative z-10" />
                  </div>
                </div>
                <div>
                  <Typography variant="h4" className="mb-1">Alex Mercer</Typography>
                  <Typography variant="muted" className="mb-4">alex@example.com</Typography>
                  <button className="px-4 py-1.5 rounded-full bg-white/10 text-xs font-medium hover:bg-white/20 transition-colors">
                    Update Profile
                  </button>
                </div>
              </div>

              {/* Form Section */}
              <div className="glass-panel rounded-3xl p-8 space-y-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/50 font-medium mb-2 block">Workspace Name</label>
                  <input 
                    type="text" 
                    defaultValue="Alex's Neural Core"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/50 font-medium mb-2 block">Knowledge Domain Focus</label>
                  <select className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none">
                    <option>Software Engineering & Architecture</option>
                    <option>Product Design & UX</option>
                    <option>General Research</option>
                  </select>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </div>

      </div>
    </PageTransition>
  );
}
