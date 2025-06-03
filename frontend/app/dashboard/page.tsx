"use client";

import { useState, useEffect } from "react";
import { MissionForm } from "@/components/mission/mission-form";
import { MissionCard } from "@/components/mission/mission-card";
import { Mission } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { z } from "zod";
import { formSchema } from "@/components/mission/mission-form";

export default function Dashboard() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await fetch("/api/missions");
      if (!response.ok) {
        throw new Error("Failed to fetch missions");
      }
      const data = await response.json();
      setMissions(data);
    } catch (error) {
      console.error("Error fetching missions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch missions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Split tags string into an array and ensure optional fields have defaults
      const processedData = {
        thread_text: data.tactics, // Map tactics to thread_text for backend
        // Send minimal data for optional fields to test
        imageUrl: data.imageUrl || null,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        trl: data.trl, // Use value directly from form
        urgency: data.urgency, // Use value directly from form
        domain: data.domain, // Use value directly from form
        environment: data.environment, // Use value directly from form
      };

      const response = await fetch("/api/forge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        throw new Error("Failed to create mission");
      }

      const newMission = await response.json();
      setMissions((prev) => [newMission, ...prev]);
      setShowForm(false);
      toast({
        title: "Success",
        description: "Mission created successfully!",
      });
    } catch (error) {
      console.error("Error creating mission:", error);
      toast({
        title: "Error",
        description: "Failed to create mission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      const response = await fetch(`/api/missions/${id}/upvote`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to upvote");
      }

      const updatedMission = await response.json();
      setMissions((prev) =>
        prev.map((mission) =>
          mission._id === id ? { ...mission, upvotes: updatedMission.upvotes } : mission
        )
      );
    } catch (error) {
      console.error("Error upvoting:", error);
      throw error;
    }
  };

  return (
    <main className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mission Dashboard</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Cancel" : "New Mission"}
        </Button>
      </div>

      {showForm && (
        <div className="max-w-2xl mx-auto">
          <MissionForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {missions.map((mission) => (
          <MissionCard
            key={mission._id}
            mission={mission}
            onUpvote={handleUpvote}
          />
        ))}
      </div>
    </main>
  );
}