"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Clock, Map, ThumbsUp, Play, Loader2, AlertTriangle, Rocket } from "lucide-react";
import { Mission } from "@/lib/types";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Leaderboard } from "@/components/mission/leaderboard";
import { startSimulation, upvoteMission } from "@/lib/mission-service";
import { MissionComments } from "@/components/mission/mission-comments";

interface MissionCardProps {
  mission: Mission;
  onUpvote?: (id: string) => Promise<void>;
}

const urgencyColors = {
  critical: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  high: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  low: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
};

const trlColors = {
  1: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  2: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  3: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20",
  4: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  5: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20",
  6: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
  7: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  8: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  9: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
};

export function MissionCard({ mission, onUpvote }: MissionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const { toast } = useToast();
  
  const { leaderboard, isLoading: isLoadingLeaderboard, error: leaderboardError } = useLeaderboard(mission._id);
  
  const formatLapTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await startSimulation(mission._id);
      toast({
        title: "Simulation Started",
        description: "SkyDive is launching with your mission.",
      });
    } catch (error) {
      console.error("Simulation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start simulation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleUpvote = async () => {
    if (!onUpvote) return;
    setIsUpvoting(true);
    try {
      await onUpvote(mission._id);
      toast({
        title: "Upvoted",
        description: "Your upvote has been recorded.",
      });
    } catch (error) {
      console.error("Upvote error:", error);
      toast({
        title: "Error",
        description: "Failed to upvote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpvoting(false);
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300",
        expanded ? "border-blue-300 dark:border-blue-800" : ""
      )}
    >
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium">{mission.mission_name || "Untitled Mission"}</CardTitle>
              <Badge 
                variant="outline" 
                className={cn(
                  "flex items-center gap-1",
                  urgencyColors[mission.meta?.urgency?.toLowerCase() as keyof typeof urgencyColors] || urgencyColors.low
                )}
              >
                <AlertTriangle className="h-3 w-3" />
                {mission.meta?.urgency || "Low"}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "flex items-center gap-1",
                  trlColors[mission.meta?.trl as keyof typeof trlColors] || trlColors[1]
                )}
              >
                <Rocket className="h-3 w-3" />
                TRL {mission.meta?.trl || 1}
              </Badge>
            </div>
            <CardDescription>
              Created {mission.created ? format(new Date(mission.created), "MMM d, yyyy") : "Unknown date"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleUpvote();
              }}
              disabled={isUpvoting}
              className="flex items-center gap-1"
            >
              {isUpvoting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4" />
              )}
              <span className="text-sm">{mission.upvotes || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSimulate();
              }}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="pt-2">
            <div className="text-sm space-y-3">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Clock className="h-4 w-4 mr-1" />
                <span className="font-medium">Lap Times</span>
              </div>
              {
                isLoadingLeaderboard ? (
                  <div className="flex items-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading leaderboard...
                  </div>
                ) : leaderboardError ? (
                  <div className="text-destructive">Failed to load leaderboard.</div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-muted-foreground">No lap times recorded yet.</div>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {leaderboard.map((entry, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{entry.pilot}:</span> {formatLapTime(entry.fastest_lap_time_sec)}
                      </li>
                    ))}
                  </ul>
                )
              }
              
              <p className="text-muted-foreground">
                {mission.meta?.terrain || "Unknown terrain"} - {mission.meta?.threats?.join(", ") || "No threats"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {mission.meta?.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">TRL</p>
                <p className="text-sm text-gray-500">{mission.meta?.trl || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Urgency</p>
                <p className="text-sm text-gray-500">{mission.meta?.urgency || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Domain</p>
                <p className="text-sm text-gray-500">{mission.meta?.domain || "N/A"}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <div className="flex items-center text-xs text-muted-foreground gap-3">
              <Map className="h-3 w-3 mr-1" />
              <span>Course #{mission.mission_name?.slice(-4) || "0000"}</span>
            </div>
          </CardFooter>
        </div>
      </div>
      {expanded && (
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Mission Details</h3>
              <p>Environment: {mission.meta?.terrain || "Unknown"}</p>
              <p>Threats: {mission.meta?.threats?.join(", ") || "None"}</p>
              <p>Wind Speed: {mission.meta?.wind_kts || 0} knots</p>
              <p>Laps: {mission.meta?.laps || 1}</p>
              <p>TRL: {mission.meta?.trl || 1}</p>
              <p>Urgency: {mission.meta?.urgency || "Low"}</p>
              <p>Domain: {mission.meta?.domain || "General"}</p>
              {mission.meta?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {mission.meta.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Leaderboard missionId={mission._id} />
            <MissionComments missionId={mission._id} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}