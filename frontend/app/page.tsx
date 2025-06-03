import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rocket, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            SimForge AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Professional drone racing simulation platform powered by AI
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
          <div className="p-6 rounded-lg border bg-card">
            <Rocket className="h-8 w-8 mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Create Missions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Design and share your drone racing missions with the community
            </p>
            <Link href="/dashboard">
              <Button className="w-full">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <Rocket className="h-8 w-8 mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Run Simulations</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Test your missions in our physics-accurate drone simulator
            </p>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                View Missions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Join our community of drone racing enthusiasts and AI researchers
        </div>
      </div>
    </main>
  );
}