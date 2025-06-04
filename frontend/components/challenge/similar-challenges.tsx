"use client";

import { useState, useEffect } from "react";
import { Challenge } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ExternalLink } from "lucide-react";
import { getSimilarChallenges } from "@/lib/challenge-service";
import Link from "next/link";

interface SimilarChallengesProps {
  challengeId: string;
  maxResults?: number;
}

export function SimilarChallenges({ challengeId, maxResults = 3 }: SimilarChallengesProps) {
  const [similarChallenges, setSimilarChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSimilarChallenges = async () => {
      try {
        setLoading(true);
        const challenges = await getSimilarChallenges(challengeId);
        setSimilarChallenges(challenges.slice(0, maxResults));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch similar challenges. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarChallenges();
  }, [challengeId, maxResults]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Similar Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (similarChallenges.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {similarChallenges.map((challenge) => (
            <div
              key={challenge._id}
              className="flex items-start justify-between gap-4 p-4 rounded-lg border"
            >
              <div className="space-y-2">
                <h4 className="font-medium line-clamp-1">{challenge.title}</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">TRL {challenge.trl}</Badge>
                  <Badge variant="secondary">{challenge.urgency}</Badge>
                  {challenge.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                asChild
              >
                <Link href={`/challenges/${challenge._id}`}>
                  View
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 