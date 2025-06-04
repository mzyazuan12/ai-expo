"use client";

import { ChallengeList } from "@/components/challenge/challenge-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function ChallengesPage() {
  const { user } = useUser();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Challenges</h1>
          <p className="text-muted-foreground mt-2">
            Browse and contribute to challenges from the DoD community.
          </p>
        </div>
        {user && (
          <Button asChild>
            <Link href="/challenges/new">
              <Plus className="h-4 w-4 mr-2" />
              New Challenge
            </Link>
          </Button>
        )}
      </div>

      <ChallengeList />
    </div>
  );
} 