"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { GradientArt } from "@/components/ui/gradient-art";

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      
      const res = await api.put("/users/me/profile", {
        first_name: firstName,
        last_name: lastName,
      });

      updateUser({
        firstName: res.data.profile?.first_name,
        lastName: res.data.profile?.last_name,
      });
      
      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setMessage("Failed to update profile: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col justify-between px-8 md:px-20 py-12 z-10 overflow-hidden">
      
      {/* Calm System Environment Artwork */}
      <GradientArt type="settings" />

      {/* Editorial Header */}
      <div className="max-w-4xl mt-12 md:mt-20 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs uppercase tracking-[0.3em] text-[#e0d7c7] mb-6 font-medium"
        >
          System Configuration
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl font-light tracking-tight text-white mb-6 leading-none"
        >
          System <span className="italic font-serif text-[#ebd7c8]">Environment</span>
        </motion.h1>

        <p className="text-lg text-white/40 font-light leading-relaxed max-w-2xl mb-12">
          Manage your spatial parameters, network credentials, and active partner node profile details.
        </p>
      </div>

      {/* Editorial Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 mt-12 relative z-10 border-t border-white/5 pt-12">
        
        {/* Navigation Sidebar */}
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest text-[#ebd7c8] font-medium pb-2 border-b border-white/5">
            Parameters
          </div>
          <button className="w-full text-left text-sm text-white/80 hover:text-white transition-colors py-1">
            Profile Credentials
          </button>
          <button className="w-full text-left text-sm text-white/40 hover:text-white transition-colors py-1">
            Vector Preferences
          </button>
          <button className="w-full text-left text-sm text-white/40 hover:text-white transition-colors py-1">
            Security Tokens
          </button>
          
          <div className="pt-8">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#e6cabc] hover:text-[#ebd7c8] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Session</span>
            </button>
          </div>
        </div>

        {/* Configurations Form */}
        <div className="md:col-span-2 space-y-8 max-w-xl">
          <div className="text-xs uppercase tracking-widest text-white/30 pb-2 border-b border-white/5">
            Profile Details
          </div>

          {message && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-[#c8dad1] tracking-wide"
            >
              {message}
            </motion.div>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#e0d7c7] to-[#b8c2d1] flex items-center justify-center text-black font-medium text-lg">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-white/30 block mb-1">Active Account</span>
                <span className="text-sm text-white/60 font-mono">{user?.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40">First Name</label>
                <Input 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  className="bg-white/[0.02] border-white/5 h-11 rounded-full text-xs placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/10" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40">Last Name</label>
                <Input 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  className="bg-white/[0.02] border-white/5 h-11 rounded-full text-xs placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/10" 
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleSaveProfile} 
              disabled={isSaving}
              className="h-11 px-6 rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-black hover:border-white transition-all text-xs font-medium tracking-wider text-[#ebd7c8]"
            >
              {isSaving ? "Syncing..." : "Save Parameters"}
            </button>
          </div>
        </div>

      </div>

      <div className="mt-16 pt-8 border-t border-white/5" />

    </div>
  );
}
