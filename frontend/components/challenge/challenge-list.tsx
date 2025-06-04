"use client";

import { useState, useEffect } from "react";
import { Challenge, SearchFilters } from "@/lib/types";
import { ChallengeSearch } from "./challenge-search";
import { ChallengeCard } from "./challenge-card";
import { getChallenges } from "@/lib/challenge-service";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function ChallengeList() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({});
  const { toast } = useToast();

  const fetchChallenges = async (searchFilters: SearchFilters) => {
    try {
      setLoading(true);
      const data = await getChallenges(searchFilters);
      setChallenges(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch challenges. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges(filters);
  }, [filters]);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <ChallengeSearch onSearch={handleSearch} initialFilters={filters} />
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No challenges found. Try adjusting your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge._id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
} 