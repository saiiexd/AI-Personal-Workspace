"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, Settings as SettingsIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

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
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and workspace preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-1">
          <SettingsTab icon={<User />} label="Profile" active />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="flex-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-xl"
          >
            <div>
              <h3 className="text-lg font-medium">Profile Information</h3>
              <p className="text-sm text-muted-foreground">Update your personal details.</p>
            </div>
            
            {message && (
              <div className="p-3 bg-white/5 border border-white/10 text-sm rounded-md">
                {message}
              </div>
            )}

            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input value={user?.email || ""} readOnly className="bg-white/5 border-white/10 opacity-70 cursor-not-allowed" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    className="bg-white/5 border-white/10" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    className="bg-white/5 border-white/10" 
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active ? "bg-white/10 text-zinc-100" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
    }`}>
      <div className="w-4 h-4">{icon}</div>
      {label}
    </button>
  );
}
