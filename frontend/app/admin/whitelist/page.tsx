"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function WhitelistPage() {
  const [whitelistedUsers, setWhitelistedUsers] = useState<string[]>([]);
  const [newUserId, setNewUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    fetchWhitelistedUsers();
  }, []);

  const fetchWhitelistedUsers = async () => {
    try {
      const response = await fetch("/api/whitelisted-users");
      if (!response.ok) throw new Error("Failed to fetch whitelisted users");
      const data = await response.json();
      setWhitelistedUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch whitelisted users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async () => {
    if (!newUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(`/api/whitelisted-users/${newUserId}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to add user");
      }

      await fetchWhitelistedUsers();
      setNewUserId("");
      toast({
        title: "Success",
        description: "User added to whitelist",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add user",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const removeUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/whitelisted-users/${userId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to remove user");
      }

      await fetchWhitelistedUsers();
      toast({
        title: "Success",
        description: "User removed from whitelist",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove user",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Whitelisted Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Clerk User ID"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
              />
              <Button onClick={addUser} disabled={isAdding}>
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add User
              </Button>
            </div>

            <div className="space-y-2">
              {whitelistedUsers.map((userId) => (
                <div
                  key={userId}
                  className="flex items-center justify-between p-2 bg-secondary rounded-lg"
                >
                  <span className="font-mono">{userId}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUser(userId)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 