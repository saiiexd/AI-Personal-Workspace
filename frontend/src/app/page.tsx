"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/workspaces");
    }
  }, [isAuthenticated, router]);

  const faqs = [
    {
      q: "How does the semantic search system index files?",
      a: "Antigravity uses high-dimensional vector embeddings to analyze the semantic meaning of your documents, notes, and tasks, enabling you to query your workspace conceptually rather than relying on exact keyword matches."
    },
    {
      q: "Can I connect external cloud storage services?",
      a: "Yes, you can integrate your database nodes and ingest raw PDF, text, and docx streams directly into the core intelligence matrix."
    },
    {
      q: "Is my workspace content private and secure?",
      a: "Absolutely. All documents and intelligence conversations are containerized, encrypted, and isolated within your private environment."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#fdfbf7] font-sans overflow-x-hidden selection:bg-[#ebd7c8]/30">
      
      {/* 1. Header */}
      <header className="w-full px-8 md:px-20 py-8 flex items-center justify-between border-b border-white/5 relative z-30">
        <div className="flex items-center gap-2">
          <span className="text-xl font-light tracking-[0.2em] uppercase text-white">Antigravity</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-white/50">
          <Link href="/login" className="hover:text-white transition-colors">Assistant</Link>
          <Link href="/login" className="hover:text-white transition-colors">Knowledge</Link>
          <Link href="/login" className="hover:text-white transition-colors">Directives</Link>
          <Link href="/login" className="hover:text-white transition-colors">Notes</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">Log In</Link>
          <Link href="/register" className="px-5 py-2 rounded-full bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors">Get Started</Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative px-8 md:px-20 pt-24 pb-12 flex flex-col items-center text-center z-20">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-8xl font-light tracking-tight leading-[1.05] max-w-5xl mb-6 text-white"
        >
          A dedicated guide for <br />
          every <span className="italic font-serif text-[#ebd7c8]">workspace</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-base md:text-lg text-white/40 tracking-wider mb-8"
        >
          Step-by-step intelligence from start to finish.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link 
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-widest hover:border-white transition-all"
          >
            <span>Enter Core</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* 3. Fluid Organic Ribbon (SVG Gradient wave across the screen) */}
      <section className="w-full relative py-12 flex justify-center overflow-hidden z-10">
        <div className="absolute inset-0 bg-[#050505] pointer-events-none" />
        <svg 
          viewBox="0 0 1440 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full min-w-[1200px] h-auto opacity-70"
        >
          <path 
            d="M0 80 C 300 180, 600 20, 900 150 C 1200 220, 1300 80, 1440 120" 
            stroke="url(#ribbonGradient)" 
            strokeWidth="8" 
            strokeLinecap="round"
          />
          <path 
            d="M0 90 C 280 160, 580 40, 920 130 C 1180 190, 1320 90, 1440 110" 
            stroke="url(#ribbonGradient2)" 
            strokeWidth="3" 
            strokeOpacity="0.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="ribbonGradient" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#b8c2d1" /> {/* soft blue */}
              <stop offset="0.5" stopColor="#ebd7c8" /> {/* peach */}
              <stop offset="1" stopColor="#dcd1eb" /> {/* lavender */}
            </linearGradient>
            <linearGradient id="ribbonGradient2" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e0d7c7" /> {/* cream */}
              <stop offset="0.5" stopColor="#ebd0a0" /> {/* warm gold */}
              <stop offset="1" stopColor="#b8c2d1" />
            </linearGradient>
          </defs>
        </svg>
      </section>

      {/* 4. Statistics */}
      <section className="max-w-7xl mx-auto px-8 md:px-20 py-16 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-b border-white/5 relative z-20">
        <div>
          <h4 className="text-4xl font-serif text-[#ebd7c8] mb-2">4.7x</h4>
          <p className="text-xs uppercase tracking-widest text-white/40">Information Retrieval Speed</p>
        </div>
        <div>
          <h4 className="text-4xl font-serif text-[#b8c2d1] mb-2">80%</h4>
          <p className="text-xs uppercase tracking-widest text-white/40">Reduction in Cognitive Clutter</p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-[#e0d7c7] mb-2">Personalized Intelligence</h4>
          <p className="text-sm text-white/50 font-light leading-relaxed">
            Every workspace adapts semantically to your notes, files, and tasks.
          </p>
        </div>
      </section>

      {/* 5. Main Interactive Showcase (3D-like glowing Core Orb) */}
      <section className="px-8 md:px-20 py-24 flex flex-col items-center relative z-20">
        <div className="w-full max-w-5xl aspect-[21/9] bg-white/[0.01] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          {/* Moving Mesh Background */}
          <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_center,_#ebd7c8_0%,_transparent_60%)] blur-[100px] animate-pulse" />
          
          {/* Concentric Wireframe Rings */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            <div className="absolute inset-0 border border-white/10 rounded-full animate-spin" style={{ animationDuration: "12s" }} />
            <div className="absolute inset-4 border border-[#ebd7c8]/20 rounded-full animate-reverse-spin" style={{ animationDuration: "16s" }} />
            <div className="absolute inset-10 bg-gradient-to-tr from-[#ebd7c8] to-[#b8c2d1] rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center text-black font-light text-xs">Core</div>
          </div>
          
          <h3 className="text-2xl font-serif text-white tracking-wide mb-3">Initialize Antigravity System</h3>
          <Link 
            href="/register"
            className="px-6 py-2 rounded-full bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors"
          >
            Launch System
          </Link>
        </div>
      </section>

      {/* 6. Feature Showcases (Alternating 2-column layout with fluid gradient canvas) */}
      <section className="max-w-7xl mx-auto px-8 md:px-20 py-20 space-y-36 relative z-20">
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#ebd7c8]">Domain One</span>
            <h3 className="text-4xl md:text-5xl font-light tracking-tight text-white leading-tight">
              Traverse your thoughts with <br />
              the <span className="italic font-serif text-[#ebd7c8]">Intelligence Core</span>
            </h3>
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-md">
              A spatial AI chat interface designed to query your library, compose files, and plan project objectives effortlessly.
            </p>
          </div>
          <div className="aspect-square w-full max-w-md mx-auto rounded-3xl bg-gradient-to-tr from-[#b8c2d1]/10 to-[#dcd1eb]/20 border border-white/5 relative overflow-hidden p-8 flex items-center justify-center">
            {/* Animated Blob */}
            <div className="w-64 h-64 rounded-full bg-[radial-gradient(circle_at_center,_#b8c2d1_0%,_transparent_70%)] blur-[40px] opacity-40 animate-pulse" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="md:order-2 space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#b8c2d1]">Domain Two</span>
            <h3 className="text-4xl md:text-5xl font-light tracking-tight text-white leading-tight">
              A digital library for <br />
              your <span className="italic font-serif text-[#b8c2d1]">documents</span>
            </h3>
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-md">
              Store, index, and preview academic publications, work documents, and notes. Everything is semantically linked.
            </p>
          </div>
          <div className="md:order-1 aspect-square w-full max-w-md mx-auto rounded-3xl bg-gradient-to-tr from-[#c8dad1]/10 to-white/[0.02] border border-white/5 relative overflow-hidden p-8 flex items-center justify-center">
            {/* Animated Blob */}
            <div className="w-64 h-64 rounded-full bg-[radial-gradient(circle_at_center,_#c8dad1_0%,_transparent_70%)] blur-[40px] opacity-40 animate-pulse" />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#ebd7c8]">Domain Three</span>
            <h3 className="text-4xl md:text-5xl font-light tracking-tight text-white leading-tight">
              Maintain momentum in <br />
              active <span className="italic font-serif text-[#ebd7c8]">directives</span>
            </h3>
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-md">
              A minimalist to-do pipeline designed for pace. Complete directives and track momentum benchmarks dynamically.
            </p>
          </div>
          <div className="aspect-square w-full max-w-md mx-auto rounded-3xl bg-gradient-to-tr from-[#ebd7c8]/10 to-[#ebd0a0]/15 border border-white/5 relative overflow-hidden p-8 flex items-center justify-center">
            {/* Animated Blob */}
            <div className="w-64 h-64 rounded-full bg-[radial-gradient(circle_at_center,_#ebd7c8_0%,_transparent_70%)] blur-[40px] opacity-40 animate-pulse" />
          </div>
        </div>

      </section>

      {/* 7. Platform Showcase */}
      <section className="px-8 md:px-20 py-24 border-t border-white/5 relative z-20">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-4">Our platform in action</h2>
          <p className="text-sm text-white/40 font-light">Explore a single screen built for multiple streams of work.</p>
        </div>
        <div className="max-w-5xl mx-auto aspect-[16/10] bg-[#0c0c0c] border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
          {/* Header of mock */}
          <div className="flex items-center gap-1.5 pb-3 border-b border-white/5 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="grid grid-cols-4 gap-4 h-full">
            <div className="col-span-1 border-r border-white/5 space-y-2 pr-2">
              <div className="h-6 w-full rounded bg-white/[0.02]" />
              <div className="h-4 w-3/4 rounded bg-white/[0.01]" />
              <div className="h-4 w-2/3 rounded bg-white/[0.01]" />
            </div>
            <div className="col-span-3 space-y-4">
              <div className="h-10 w-1/3 rounded bg-white/[0.02]" />
              <div className="h-32 w-full rounded bg-white/[0.01]" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Accordion FAQ Section */}
      <section className="max-w-3xl mx-auto px-8 py-24 relative z-20">
        <h2 className="text-3xl font-light text-center text-white mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div key={i} className="border-b border-white/5 pb-4">
                <button 
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between text-left py-4 hover:text-[#ebd7c8] transition-colors"
                >
                  <span className="text-base font-light tracking-wide text-white">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="text-sm text-white/40 font-light leading-relaxed pt-2 pb-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Bottom CTA (Hands Reaching & Particle Sphere) */}
      <section className="px-8 md:px-20 py-32 border-t border-white/5 flex flex-col items-center justify-center text-center relative z-20 bg-[#070707]">
        <div className="relative w-full max-w-lg h-32 flex items-center justify-between pointer-events-none mb-8">
          {/* Hand lines drawn minimally */}
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-white/30" />
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ebd7c8] to-[#b8c2d1] blur-md opacity-30 animate-pulse" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-white/30" />
        </div>

        <h3 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-4">Start writing your library</h3>
        <p className="text-sm text-white/40 mb-8 max-w-sm">Connect your thoughts to the Antigravity core platform today.</p>
        
        <Link 
          href="/register"
          className="px-8 py-3 rounded-full bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition-colors"
        >
          Initialize Workspace
        </Link>
      </section>

    </div>
  );
}
