"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Challenge } from "@/lib/types";
import { ChallengeCard } from "@/components/challenge/challenge-card";
import { SolutionForm } from "@/components/challenge/solution-form";
import { SolutionList } from "@/components/challenge/solution-list";
import { ChallengeModerator } from "@/components/challenge/challenge-moderator";
import { SimilarChallenges } from "@/components/challenge/similar-challenges";
import { getChallenge } from "@/lib/challenge-service";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function ChallengePage() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isLoaded: isUserLoaded } = useUser();

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        const data = await getChallenge(id as string);
        setChallenge(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch challenge. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChallenge();
    }
  }, [id]);

  const handleSolutionSubmit = () => {
    // Refresh the challenge data to show the new solution
    if (id) {
      getChallenge(id as string).then(setChallenge);
    }
  };

  const handleStateChange = () => {
    // Refresh the challenge data after state change
    if (id) {
      getChallenge(id as string).then(setChallenge);
    }
  };

  if (loading || !isUserLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold">Challenge not found</h1>
        <p className="text-muted-foreground mt-2">
          The challenge you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const isModerator = user?.publicMetadata?.role === "moderator";

  return (
    <div className="container mx-auto py-8 space-y-8">
      <ChallengeCard challenge={challenge} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isModerator && (
            <ChallengeModerator
              challenge={challenge}
              onStateChange={handleStateChange}
            />
          )}

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Solutions</h2>
            {user ? (
              <SolutionForm
                challengeId={challenge._id}
                onSuccess={handleSolutionSubmit}
              />
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">
                  Please sign in to submit a solution.
                </p>
              </div>
            )}

            {challenge.solutions && challenge.solutions.length > 0 ? (
              <SolutionList
                solutions={challenge.solutions}
                onUpvote={handleSolutionSubmit}
              />
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">
                  No solutions have been submitted yet.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <SimilarChallenges challengeId={challenge._id} />
        </div>
      </div>
    </div>
  );
} 