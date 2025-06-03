"use client";

import Link from "next/link";
import { Bone as Drone } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Drone className="h-6 w-6 text-blue-500" />
          <span className="hidden font-bold sm:inline-block">
            SimForge AI
          </span>
        </Link>
        <div className="flex-1"></div>
        <nav className="flex items-center gap-4 text-sm">
          <Link 
            href="/dashboard" 
            className="transition-colors hover:text-primary font-medium"
          >
            Dashboard
          </Link>
          <Link 
            href="#" 
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Leaderboard
          </Link>
          <Link 
            href="#" 
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}