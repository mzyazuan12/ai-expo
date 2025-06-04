"use client";

import { useState } from "react";
import { Challenge } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { updateChallengeState } from "@/lib/challenge-service";

interface ChallengeModeratorProps {
  challenge: Challenge;
  onStateChange?: () => void;
}

export function ChallengeModerator({ challenge, onStateChange }: ChallengeModeratorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const { toast } = useToast();

  const handleStateChange = async (newState: string) => {
    try {
      setIsSubmitting(true);
      await updateChallengeState(challenge._id, newState, reviewNotes);
      
      toast({
        title: "Success",
        description: `Challenge ${newState} successfully.`,
      });
      
      setReviewNotes("");
      onStateChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update challenge state. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending_review":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Moderate Challenge</span>
          {getStateIcon(challenge.state)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Review Notes</label>
          <Textarea
            placeholder="Add notes about your decision..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleStateChange("approved")}
            disabled={isSubmitting || challenge.state === "approved"}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Approve
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleStateChange("rejected")}
            disabled={isSubmitting || challenge.state === "rejected"}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Reject
              </>
            )}
          </Button>
        </div>

        {challenge.review_notes && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Previous Review Notes</h4>
            <p className="text-sm text-muted-foreground">
              {challenge.review_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 