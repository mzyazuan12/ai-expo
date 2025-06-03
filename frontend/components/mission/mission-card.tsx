"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Clock, Map } from "lucide-react";
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

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const { toast } = useToast();
  
  const formatLapTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
  };

  const handleLaunchSimulation = async () => {
    setIsLaunching(true);
    try {
      const response = await fetch('/api/forge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_text: mission.tactics,
          image_url: mission.imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to launch simulation');
      }

      toast({
        title: "Simulation Launched",
        description: "The simulator is starting up...",
      });
    } catch (error) {
      console.error('Error launching simulation:', error);
      toast({
        title: "Launch Failed",
        description: "Could not start the simulation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLaunching(false);
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
            <CardTitle className="text-base font-medium">{mission.name}</CardTitle>
            <CardDescription>
              Created {format(new Date(mission.createdAt), "MMM d, yyyy")}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
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
                {mission.bestLapTime ? (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="font-medium">Best Lap Time:</span>{" "}
                    <span className="ml-1">{formatLapTime(mission.bestLapTime)}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>No lap times recorded yet</span>
                  </div>
                )}
              </div>
              
              <p className="text-muted-foreground">
                {mission.tactics.length > 150
                  ? mission.tactics.slice(0, 150) + "..."
                  : mission.tactics}
              </p>
              
              {mission.imageUrl && (
                <div className="mt-4 rounded-md overflow-hidden border">
                  <img
                    src={mission.imageUrl}
                    alt={`Course for ${mission.name}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <div className="flex items-center text-xs text-muted-foreground">
              <Map className="h-3 w-3 mr-1" />
              <span>Course #{mission.id.slice(-4)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={handleLaunchSimulation}
              disabled={isLaunching}
            >
              {isLaunching ? (
                <>
                  <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Launching...
                </>
              ) : (
                "Run Simulation"
              )}
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}