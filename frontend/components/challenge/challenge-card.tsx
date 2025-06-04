"use client";

import { useState } from "react";
import { Challenge } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare, Video, Shield, Clock, Tag, ArrowUp, Eye } from "lucide-react";
import { upvoteChallenge } from "@/lib/challenge-service";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ChallengeCardProps {
  challenge: Challenge;
  onUpvote?: (id: string) => void;
  onView?: (id: string) => void;
}

export function ChallengeCard({ challenge, onUpvote, onView }: ChallengeCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(challenge.upvotes);
  const { toast } = useToast();

  const handleUpvote = async () => {
    try {
      await upvoteChallenge(challenge._id);
      setUpvoted(true);
      setUpvotes(prev => prev + 1);
      toast({
        title: "Success",
        description: "Challenge upvoted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upvote challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const urgencyColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  const trlColors = {
    1: "bg-blue-100 text-blue-800",
    2: "bg-blue-200 text-blue-800",
    3: "bg-blue-300 text-blue-800",
    4: "bg-blue-400 text-blue-800",
    5: "bg-blue-500 text-white",
    6: "bg-blue-600 text-white",
    7: "bg-blue-700 text-white",
    8: "bg-blue-800 text-white",
    9: "bg-blue-900 text-white",
  };

  const stateColors = {
    open: "bg-green-500",
    pending_review: "bg-yellow-500",
    closed: "bg-gray-500",
    rejected: "bg-red-500",
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{challenge.title}</CardTitle>
            <CardDescription className="mt-2">
              {formatDistanceToNow(new Date(challenge.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={urgencyColors[challenge.urgency]}>
              {challenge.urgency}
            </Badge>
            <Badge variant="outline" className={stateColors[challenge.state]}>
              {challenge.state}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-3">{challenge.body_md}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {challenge.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>TRL {challenge.trl}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{challenge.solutions?.length || 0} solutions</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpvote?.(challenge._id)}
          className="flex items-center gap-1"
        >
          <ArrowUp className="h-4 w-4" />
          <span>{upvotes}</span>
        </Button>
        <Link href={`/challenges/${challenge._id}`}>
          <Button variant="default" size="sm" onClick={() => onView?.(challenge._id)}>
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 