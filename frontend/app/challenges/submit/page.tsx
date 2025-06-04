"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";
import { ChallengeForm } from "@/components/challenge/challenge-form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Shield, UserCheck } from "lucide-react";
import type { ChallengeFormData } from "@/lib/types";

export default function SubmitChallengePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userVerification, setUserVerification] = useState<{
    isVerified: boolean;
    role?: string;
    clearance_level?: string;
  } | null>(null);

  useEffect(() => {
    const checkVerification = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/users/${user.id}/verification`);
        if (!response.ok) throw new Error("Failed to fetch verification status");
        
        const data = await response.json();
        setUserVerification(data);
      } catch (error) {
        console.error("Error checking verification:", error);
        toast({
          title: "Error",
          description: "Failed to check verification status. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (isLoaded && user) {
      checkVerification();
    }
  }, [user, isLoaded, toast]);

  const onSubmit = async (data: ChallengeFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to submit a challenge.",
        variant: "destructive",
      });
      return;
    }

    if (!userVerification?.isVerified) {
      toast({
        title: "Error",
        description: "Your account must be verified to submit challenges.",
        variant: "destructive",
      });
      router.push("/verify");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          author_uid: user.id,
          verification_required: data.classification_level !== "unclassified",
          allowed_provider_types: ["academia", "startup", "industry"],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create challenge");
      }

      const challenge = await response.json();
      toast({
        title: "Success",
        description: "Challenge submitted successfully.",
      });

      router.push(`/challenges/${challenge._id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You must be signed in to submit challenges. Please sign in to continue.
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/sign-in")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!userVerification?.isVerified) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Verification Required</AlertTitle>
            <AlertDescription>
              Your account needs to be verified before you can submit challenges. Please complete the verification process.
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/verify")}>
            Complete Verification
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="h-5 w-5 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Verified {userVerification.role} • {userVerification.clearance_level} Clearance
            </span>
          </div>
          <h1 className="text-3xl font-bold">Submit Challenge</h1>
          <p className="text-muted-foreground mt-2">
            Create a new challenge for the DoD community. Your submission will be reviewed for OPSEC compliance.
          </p>
        </div>

        <ChallengeForm onSubmit={onSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
} 