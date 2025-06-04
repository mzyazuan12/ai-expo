"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Shield, UserCheck } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { Challenge } from "@/lib/types";

const solutionSchema = z.object({
  content: z.string().min(20, "Solution must be at least 20 characters long"),
  trl: z.number().min(1).max(9),
  video_url: z.string().url().optional(),
  attachments: z.string().optional(),
  is_anonymous: z.boolean().default(false),
});

type SolutionFormData = z.infer<typeof solutionSchema>;

export default function SubmitSolutionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userVerification, setUserVerification] = useState<{
    isVerified: boolean;
    role?: string;
    provider_details?: {
      type: string;
      institution_name?: string;
    };
  } | null>(null);

  const form = useForm<SolutionFormData>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      content: "",
      trl: 1,
      video_url: "",
      attachments: "",
      is_anonymous: false,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch challenge details
        const challengeResponse = await fetch(`/api/challenges/${params.id}`);
        if (!challengeResponse.ok) throw new Error("Failed to fetch challenge");
        const challengeData = await challengeResponse.json();
        setChallenge(challengeData);

        // Fetch user verification status
        const verificationResponse = await fetch(`/api/users/${user.id}/verification`);
        if (!verificationResponse.ok) throw new Error("Failed to fetch verification status");
        const verificationData = await verificationResponse.json();
        setUserVerification(verificationData);

        // Check if user's provider type is allowed
        if (challengeData.allowed_provider_types && 
            !challengeData.allowed_provider_types.includes(verificationData.provider_details?.type)) {
          toast({
            title: "Access Denied",
            description: "Your provider type is not allowed for this challenge.",
            variant: "destructive",
          });
          router.push(`/challenges/${params.id}`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load required data. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (isLoaded && user) {
      fetchData();
    }
  }, [user, isLoaded, params.id, router, toast]);

  const onSubmit = async (data: SolutionFormData) => {
    if (!user || !userVerification?.isVerified || !challenge) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/challenges/${params.id}/solutions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          provider_id: user.id,
          provider_name: data.is_anonymous ? "Anonymous" : userVerification.provider_details?.institution_name,
          provider_type: userVerification.provider_details?.type,
          attachments: data.attachments ? data.attachments.split(",").map(url => url.trim()) : [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit solution");
      }

      toast({
        title: "Success",
        description: "Solution submitted successfully.",
      });

      router.push(`/challenges/${params.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit solution. Please try again.",
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
              You must be signed in to submit solutions. Please sign in to continue.
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
              Your account needs to be verified before you can submit solutions. Please complete the verification process.
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/verify")}>
            Complete Verification
          </Button>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Challenge Not Found</AlertTitle>
            <AlertDescription>
              The requested challenge could not be found.
            </AlertDescription>
          </Alert>
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
              Verified {userVerification.role} • {userVerification.provider_details?.institution_name}
            </span>
          </div>
          <h1 className="text-3xl font-bold">Submit Solution</h1>
          <p className="text-muted-foreground mt-2">
            Submit your solution for the challenge: {challenge.title}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solution</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your solution in detail..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of your solution, including any relevant technical details.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TRL Level</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select TRL" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          TRL {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Technology Readiness Level of your solution.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/video"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Link to a video demonstration of your solution.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachments (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter URLs separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Links to any supporting documents or resources.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_anonymous"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Submit anonymously</FormLabel>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Solution"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
} 