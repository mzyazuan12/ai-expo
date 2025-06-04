import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rocket, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center p-4 bg-cover bg-center" style={{ backgroundImage: "url('/placeholder-background.jpg')" }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="z-10 max-w-4xl mx-auto space-y-6 text-white">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Unleash Your Drone Racing Skills with AI Simulation
          </h1>
          <p className="text-lg md:text-xl leading-relaxed">
            Design, simulate, and compete in challenging drone racing missions powered by advanced AI.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section (Optional - can keep or modify) */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features that Elevate Your Race</h2>
            <p className="text-muted-foreground md:text-xl">
              Explore the powerful capabilities of SimForge AI designed for drone enthusiasts and professionals.
            </p>
          </div>
          <div className="grid gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 p-6 rounded-lg border bg-card">
              <Rocket className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-semibold">AI-Powered Mission Forge</h3>
              <p className="text-muted-foreground text-center">
                Create dynamic and challenging missions with the help of our intelligent AI.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 rounded-lg border bg-card">
              <ArrowRight className="h-10 w-10 text-primary" /> {/* Reusing icon for now, replace with relevant icon */}
              <h3 className="text-xl font-semibold">Realistic Simulation</h3>
              <p className="text-muted-foreground text-center">
                Test your piloting skills in a physically accurate Webots environment.
              회를              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 rounded-lg border bg-card">
              <Rocket className="h-10 w-10 text-primary" /> {/* Reusing icon for now, replace with relevant icon */}
              <h3 className="text-xl font-semibold">Community & Competition</h3>
              <p className="text-muted-foreground text-center">
                Share your missions, compete on leaderboards, and connect with other pilots.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder for other sections like Testimonials, Footer, etc. */}
    </div>
  );
}