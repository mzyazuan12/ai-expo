"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Clock, RotateCw, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mission } from "@/lib/types";
import { MissionCard } from "@/components/mission/mission-card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface MissionHistoryProps {
  missions: Mission[];
  isLoading: boolean;
  refreshMissions: () => Promise<void>;
}

export function MissionHistory({
  missions,
  isLoading,
  refreshMissions,
}: MissionHistoryProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>([]);

  useEffect(() => {
    refreshMissions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMissions(missions);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMissions(
        missions.filter(
          (mission) =>
            mission.name.toLowerCase().includes(query) ||
            mission.tactics.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, missions]);

  const handleRefresh = async () => {
    try {
      await refreshMissions();
      toast({
        title: "Missions Refreshed",
        description: "Your mission history has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh mission history. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              Mission History
            </CardTitle>
            <CardDescription>
              View and manage your previous racing missions.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-9 gap-1"
          >
            <RotateCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only sm:not-sr-only sm:inline-block">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Search missions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <MissionCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredMissions.length > 0 ? (
            <div className="space-y-3">
              {filteredMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Clock className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No missions found</h3>
              <p className="text-muted-foreground max-w-xs mt-1">
                {missions.length === 0
                  ? "Create your first mission to get started with SimForge AI."
                  : "No missions match your search criteria."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MissionCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg animate-pulse">
      <div className="flex justify-between">
        <div className="h-5 w-40 bg-muted rounded"></div>
        <div className="h-5 w-20 bg-muted rounded"></div>
      </div>
      <div className="h-4 w-32 bg-muted rounded mt-4"></div>
      <div className="h-3 w-24 bg-muted rounded mt-3"></div>
    </div>
  );
}