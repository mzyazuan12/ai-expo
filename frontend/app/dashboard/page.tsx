"use client";

import { useState, useEffect } from "react";
import { MissionForm, formSchema } from "@/components/mission/mission-form";
import { MissionCard } from "@/components/mission/mission-card";
import { Mission } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { z } from "zod";
import { ChallengeForm } from "@/components/challenge/challenge-form";
import { Challenge } from "@/lib/types";
import { ChallengeCard } from "@/components/challenge/challenge-card";
import type { ChallengeFormData } from "@/lib/types";

export default function Dashboard() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoadingMission, setIsLoadingMission] = useState(false);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMissions();
    fetchChallenges();
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

  const fetchChallenges = async () => {
    try {
      const response = await fetch("/api/challenges");
      if (!response.ok) {
        throw new Error("Failed to fetch challenges");
      }
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      toast({
        title: "Error",
        description: "Failed to fetch challenges. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMissionSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoadingMission(true);
    try {
      const processedData = {
        mission_name: data.mission_name,
        thread_text: data.thread_text,
        imageUrl: data.imageUrl || null,
        tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
        meta: {
          trl: data.trl,
          urgency: data.urgency,
          domain: data.domain,
          environment: data.environment,
          threats: data.threats ? data.threats.split(',').map((threat: string) => threat.trim()) : [],
          wind_kts: data.wind_kts,
          laps: data.laps,
          is_anonymous: data.is_anonymous
        }
      };

      const response = await fetch("/api/forge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) { throw new Error("Failed to create mission"); }

      const newMission = await response.json();
      setMissions((prev) => [newMission, ...prev]);
      setShowMissionForm(false);
      toast({ title: "Success", description: "Mission created successfully!" });
    } catch (error) {
      console.error("Error creating mission:", error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create mission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMission(false);
    }
  };

  const handleChallengeSubmit = async (data: ChallengeFormData) => {
    setIsLoadingChallenge(true);
    try {
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
      };

      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) { throw new Error("Failed to create challenge"); }

      const newChallenge = await response.json();
      setChallenges((prev) => [newChallenge, ...prev]);
      setShowChallengeForm(false);
      toast({ title: "Success", description: "Challenge created successfully!" });
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast({
        title: "Error", description: error instanceof Error ? error.message : "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to ensure finally block runs
    } finally {
      setIsLoadingChallenge(false);
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

  const handleChallengeStateChange = async (challengeId: string, newState: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: newState }),
      });

      if (!response.ok) {
        throw new Error("Failed to update challenge state");
      }

      const updatedChallenge = await response.json();
      setChallenges((prev) =>
        prev.map((challenge) =>
          challenge._id === challengeId ? updatedChallenge : challenge
        )
      );
    } catch (error) {
      console.error("Error updating challenge state:", error);
      throw error;
    }
  };

  return (
    <main className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mission Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => {
            setShowMissionForm(!showMissionForm);
            setShowChallengeForm(false);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            {showMissionForm ? "Cancel Mission" : "New Mission"}
          </Button>
          <Button onClick={() => {
            setShowChallengeForm(!showChallengeForm);
            setShowMissionForm(false);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            {showChallengeForm ? "Cancel Challenge" : "New Challenge"}
          </Button>
        </div>
      </div>

      {showMissionForm && (
        <div className="max-w-2xl mx-auto">
          <MissionForm onSubmit={handleMissionSubmit} isLoading={isLoadingMission} />
        </div>
      )}

      {showChallengeForm && (
        <div className="max-w-2xl mx-auto">
          <ChallengeForm onSubmit={handleChallengeSubmit} isLoading={isLoadingChallenge} />
        </div>
      )}

      {!showMissionForm && !showChallengeForm && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Display Challenges */}
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge._id}
              challenge={challenge}
            />
          ))}
           {/* Display Missions */}
           {missions.map((mission) => (
            <MissionCard
              key={mission._id}
              mission={mission}
              onUpvote={handleUpvote}
            />
          ))}
        </div>
      )}
    </main>
  );
}