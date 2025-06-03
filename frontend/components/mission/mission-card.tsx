"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Clock, Map, ThumbsUp, Play, Pause, Loader2 } from "lucide-react";
import { Mission } from "@/lib/types";
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

interface MissionCardProps {
  mission: Mission;
  onUpvote: (id: string) => Promise<void>;
}

export function MissionCard({ mission, onUpvote }: MissionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const { toast } = useToast();
  
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
      const response = await fetch(`/api/simulate/${mission._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to start simulation");
      }

      const data = await response.json();
      if (data.status === "success") {
        toast({
          title: "Simulation Started",
          description: "SkyDive is launching with your mission.",
        });
      } else {
        throw new Error(data.message || "Failed to start simulation");
      }
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
    setIsUpvoting(true);
    try {
      await onUpvote(mission.id);
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
            <CardTitle className="text-base font-medium">{mission.mission_name || "Untitled Mission"}</CardTitle>
            <CardDescription>
              Created {mission.created ? format(new Date(mission.created), "MMM d, yyyy") : "Unknown date"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {mission.upvotes || 0}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              disabled={isUpvoting}
            >
              {isUpvoting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4" />
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
                {mission.scores && mission.scores.length > 0 ? (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="font-medium">Best Lap Time:</span>{" "}
                    <span className="ml-1">{formatLapTime(Math.min(...mission.scores.map(s => s.lap_time_sec)))}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>No lap times recorded yet</span>
                  </div>
                )}
              </div>
              
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
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={handleSimulate}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Simulate
                </>
              )}
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}