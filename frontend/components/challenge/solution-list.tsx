"use client";

import { useState } from "react";
import { Solution } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Video, FileText, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface SolutionListProps {
  solutions: Solution[];
  onUpvote?: (solutionId: string) => Promise<void>;
}

export function SolutionList({ solutions, onUpvote }: SolutionListProps) {
  const [upvotedSolutions, setUpvotedSolutions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleUpvote = async (solutionId: string) => {
    if (upvotedSolutions.has(solutionId)) return;
    
    try {
      if (onUpvote) {
        await onUpvote(solutionId);
        setUpvotedSolutions(prev => new Set([...prev, solutionId]));
        toast({
          title: "Success",
          description: "Solution upvoted successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upvote solution. Please try again.",
        variant: "destructive",
      });
    }
  };

  const providerTypeColors = {
    academia: "bg-blue-100 text-blue-800",
    startup: "bg-green-100 text-green-800",
    industry: "bg-purple-100 text-purple-800",
    government: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-4">
      {solutions.map((solution) => (
        <Card key={solution._id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={solution.provider.avatar} />
                  <AvatarFallback>
                    {solution.provider.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base font-semibold">
                    {solution.provider.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(solution.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={providerTypeColors[solution.provider_type]}
              >
                {solution.provider_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {solution.content}
              </p>

              {solution.attachments && solution.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {solution.attachments.map((attachment, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      {attachment}
                    </Badge>
                  ))}
                </div>
              )}

              {solution.video_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  asChild
                >
                  <a
                    href={solution.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video className="h-4 w-4" />
                    Watch Video
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}

              <div className="flex items-center gap-4 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpvote(solution._id)}
                  disabled={upvotedSolutions.has(solution._id)}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp
                    className={`h-4 w-4 ${
                      upvotedSolutions.has(solution._id) ? "text-primary" : ""
                    }`}
                  />
                  <span>{solution.upvotes}</span>
                </Button>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{solution.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 