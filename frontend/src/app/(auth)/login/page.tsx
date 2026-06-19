"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      // OAuth2 form data
      const formData = new URLSearchParams();
      formData.append("username", data.username);
      formData.append("password", data.password);
      
      const response = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      
      const { access_token } = response.data;
      
      // Fetch profile
      const profileRes = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      login(profileRes.data, access_token);
      router.push("/workspaces");
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Invalid email or password");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Enter your credentials to access your workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Input 
            {...register("username")} 
            placeholder="name@example.com" 
            type="email"
            autoComplete="email"
            className={errors.username ? "border-destructive" : ""}
          />
          {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Input 
            {...register("password")} 
            placeholder="Password" 
            type="password"
            autoComplete="current-password"
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <Link href="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </motion.div>
  );
}
