"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";

interface Comment {
  _id: string;
  content: string;
  author: string;
  created: string;
}

interface MissionCommentsProps {
  missionId: string;
}

export function MissionComments({ missionId }: MissionCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/missions/${missionId}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to comment",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/missions/${missionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) throw new Error("Failed to post comment");
      
      const comment = await response.json();
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-medium">Comments</h3>
      </div>
      
      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !newComment.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{comment.author}</span>
              <span className="text-sm text-muted-foreground">
                {format(new Date(comment.created), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <p className="mt-2 text-sm">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 