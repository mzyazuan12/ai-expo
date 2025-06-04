"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";
import { VerificationForm } from "@/components/auth/verification-form";
import type { VerificationFormData } from "@/components/auth/verification-form";

export default function VerifyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: VerificationFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to verify your account.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          user_id: user.id,
          email: user.emailAddresses[0].emailAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit verification request");
      }

      toast({
        title: "Success",
        description: "Verification request submitted successfully. We will review your request and contact you soon.",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit verification request. Please try again.",
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
          <h1 className="text-3xl font-bold">Verify Your Account</h1>
          <p className="text-muted-foreground mt-2">
            Complete the verification process to access the platform.
          </p>
        </div>

        <VerificationForm onSubmit={onSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
} 