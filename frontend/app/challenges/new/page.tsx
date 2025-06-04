"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { createChallenge } from "@/lib/challenge-service";
import { useUser } from "@clerk/nextjs";
import { ChallengeForm } from "@/components/challenge/challenge-form";
import type { ChallengeFormData } from "@/lib/types";

export default function NewChallengePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: ChallengeFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to create a challenge.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const challenge = await createChallenge({
        ...values,
        tags: values.tags ? values.tags.split(",").map(tag => tag.trim()) : [],
      });

      toast({
        title: "Success",
        description: "Challenge created successfully.",
      });

      router.push(`/challenges/${challenge._id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Create New Challenge</h1>
          <p className="text-muted-foreground mt-2">
            Submit a new challenge to the DoD community.
          </p>
        </div>

        <ChallengeForm onSubmit={onSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
} 