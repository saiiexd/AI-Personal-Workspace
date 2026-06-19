"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth-store";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError(null);
      await api.post("/auth/register", data);
      
      // Auto login after registration
      const formData = new URLSearchParams();
      formData.append("username", data.email);
      formData.append("password", data.password);
      
      const loginRes = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      
      const { access_token } = loginRes.data;
      
      const profileRes = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      login(profileRes.data, access_token);
      router.push("/workspaces");
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Registration failed. Please try again.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground text-sm">Join AI Personal Workspace today.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input 
              {...register("first_name")} 
              placeholder="First Name" 
              className={errors.first_name ? "border-destructive" : ""}
            />
            {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Input 
              {...register("last_name")} 
              placeholder="Last Name" 
              className={errors.last_name ? "border-destructive" : ""}
            />
            {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Input 
            {...register("email")} 
            placeholder="name@example.com" 
            type="email"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Input 
            {...register("password")} 
            placeholder="Password" 
            type="password"
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </motion.div>
  );
}
