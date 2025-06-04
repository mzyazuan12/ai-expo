"use client";

import { format } from "date-fns";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Challenge } from "@/lib/types"; // Assuming you have a Challenge type defined here
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs"; // Import useUser hook
import useSWR from "swr"; // Import SWR

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Custom hook to fetch whitelisted users
function useWhitelistedUsers() {
  const { data, error } = useSWR("/api/whitelisted-users", fetcher);
  return {
    whitelistedUsers: data,
    isLoading: !error && !data,
    isError: error,
  };
}

interface ChallengeCardProps {
  challenge: Challenge;
  onStateChange?: (challengeId: string, newState: string) => void;
}

export function ChallengeCard({ challenge, onStateChange }: ChallengeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useUser(); // Get the current user
  const { whitelistedUsers, isLoading } = useWhitelistedUsers(); // Fetch whitelisted users

  // Check if the current user is whitelisted
  const isWhitelisted = user && whitelistedUsers?.includes(user.id);

  const getStateBadgeVariant = (state: string) => {
    switch (state) {
      case "whitelisted":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case "whitelisted":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStateChange = async (newState: string) => {
    if (!onStateChange) return;
    
    setIsUpdating(true);
    try {
      await onStateChange(challenge._id, newState);
      toast({
        title: "Success",
        description: `Challenge ${newState} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update challenge state",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        expanded ? "border-green-300 dark:border-green-800" : ""
      )}
    >
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">{challenge.title || "Untitled Challenge"}</CardTitle>
            <CardDescription>
              Created {challenge.created ? format(new Date(challenge.created), "MMM d, yyyy") : "Unknown date"}
            </CardDescription>
          </div>
          <Badge variant={getStateBadgeVariant(challenge.state)} className="flex items-center gap-1">
            {getStateIcon(challenge.state)}
            {challenge.state || "pending"}
          </Badge>
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
            <p className="text-sm text-muted-foreground mb-3">
              {challenge.body_md}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {challenge.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
             <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">TRL</p>
                <p className="text-gray-500">{challenge.trl || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Urgency</p>
                <p className="text-gray-500">{challenge.urgency || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Domain</p>
                <p className="text-gray-500">{challenge.domain || "N/A"}</p>
              </div>
               {challenge.author_uid && (
                 <div>
                    <p className="font-medium">Author</p>
                    <p className="text-gray-500">{challenge.author_uid}</p>
                 </div>
               )}
               {challenge.redactions && challenge.redactions.length > 0 && (
                 <div>
                     <p className="font-medium">Redactions</p>
                     <p className="text-gray-500">{challenge.redactions.join(", ")}</p>
                 </div>
               )}
            </div>
          </CardContent>
          {/* Conditionally render moderation buttons for whitelisted users */}
          {onStateChange && isWhitelisted && (
            <CardFooter className="flex justify-end gap-2 pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStateChange("whitelisted")}
                disabled={isUpdating || challenge.state === "whitelisted"}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Whitelist
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStateChange("rejected")}
                disabled={isUpdating || challenge.state === "rejected"}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </CardFooter>
          )}
        </div>
      </div>
    </Card>
  );
} 