"use client";

import { useState } from "react";
import { MissionForm } from "@/components/mission/mission-form";
import { MissionHistory } from "@/components/mission/mission-history";
import { Mission } from "@/lib/types";
import { createMission, getMissions } from "@/lib/mission-service";

interface DashboardProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function Dashboard({ isLoading, setIsLoading }: DashboardProps) {
  const [missions, setMissions] = useState<Mission[]>([]);

  const handleCreateMission = async (data: {
    tactics: string;
    imageUrl?: string;
  }) => {
    setIsLoading(true);
    try {
      const newMission = await createMission(data);
      setMissions((prev) => [newMission, ...prev]);
    } catch (error) {
      console.error("Failed to create mission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMissions = async () => {
    setIsLoading(true);
    try {
      const fetchedMissions = await getMissions();
      setMissions(fetchedMissions);
    } catch (error) {
      console.error("Failed to fetch missions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <MissionForm onSubmit={handleCreateMission} isLoading={isLoading} />
      <MissionHistory
        missions={missions}
        isLoading={isLoading}
        refreshMissions={refreshMissions}
      />
    </div>
  );
}