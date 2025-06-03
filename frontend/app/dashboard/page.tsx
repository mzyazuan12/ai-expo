"use client";

import { useState } from "react";
import { Dashboard } from "@/components/dashboard/dashboard";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">SimForge AI Dashboard</h1>
            <ThemeToggle />
          </div>
          <Dashboard isLoading={isLoading} setIsLoading={setIsLoading} />
        </div>
      </div>
    </div>
  );
}