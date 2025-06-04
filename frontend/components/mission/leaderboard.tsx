"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface LeaderboardEntry {
  pilot: string;
  fastest_lap_time_sec: number;
}

interface LeaderboardProps {
  missionId: string;
}

export function Leaderboard({ missionId }: LeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`/api/missions/${missionId}/leaderboard`);
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }
        const data = await response.json();
        setLeaderboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [missionId]);

  if (isLoading) {
    return <div>Loading leaderboard...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Pilot</TableHead>
              <TableHead>Fastest Lap Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((entry, index) => (
              <TableRow key={entry.pilot}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{entry.pilot}</TableCell>
                <TableCell>{format(entry.fastest_lap_time_sec * 1000, "mm:ss.SSS")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 