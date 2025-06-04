"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  // Check if already authenticated
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In production, this should be a secure API call
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem("adminToken", "admin");
      setIsAuthenticated(true);
      toast({
        title: "Success",
        description: "Welcome to admin dashboard",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button
          variant="destructive"
          onClick={() => {
            localStorage.removeItem("adminToken");
            setIsAuthenticated(false);
            router.push("/");
          }}
        >
          Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Mission Management</h2>
          <p className="text-gray-600">Manage missions, challenges, and leaderboard</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-600">View and manage user accounts</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">System Settings</h2>
          <p className="text-gray-600">Configure system parameters and preferences</p>
        </div>
      </div>
    </div>
  );
} 