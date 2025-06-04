import useSWR from 'swr';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Define the structure of a leaderboard entry
interface LeaderboardEntry {
  pilot: string;
  fastest_lap_time_sec: number;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

export const useLeaderboard = (missionId: string | null) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

  // Fetch initial data using SWR
  const { data, error } = useSWR(missionId ? `/api/missions/${missionId}/leaderboard` : null, fetcher);

  // Update state when initial data is fetched
  useEffect(() => {
    if (data) {
      // Ensure data is an array and sort it
      const sortedData = Array.isArray(data) ? [...data].sort((a, b) => a.fastest_lap_time_sec - b.fastest_lap_time_sec) : [];
      setLeaderboard(sortedData);
    }
  }, [data]);

  // Setup Socket.IO connection
  useEffect(() => {
    if (!missionId) return;

    // Connect to the Socket.IO server (FastAPI backend)
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log(`Socket.IO connected for mission ${missionId}`);
      // Join the mission-specific room
      newSocket.emit('join_room', missionId);
    });

    newSocket.on('score_update', (score: LeaderboardEntry) => {
      console.log('Score update received:', score);
      setLeaderboard(currentLeaderboard => {
        // Find if the pilot already exists
        const existingIndex = currentLeaderboard.findIndex(entry => entry.pilot === score.pilot);

        let updatedLeaderboard;
        if (existingIndex > -1) {
          // Update existing pilot's fastest lap if the new one is faster
          updatedLeaderboard = [...currentLeaderboard];
          if (score.fastest_lap_time_sec < updatedLeaderboard[existingIndex].fastest_lap_time_sec) {
             updatedLeaderboard[existingIndex] = score;
          }
        } else {
          // Add new pilot's score
          updatedLeaderboard = [...currentLeaderboard, score];
        }

        // Re-sort the leaderboard
        return updatedLeaderboard.sort((a, b) => a.fastest_lap_time_sec - b.fastest_lap_time_sec);
      });
    });

    newSocket.on('disconnect', () => {
      console.log(`Socket.IO disconnected for mission ${missionId}`);
    });

    // Clean up socket connection on component unmount or missionId change
    return () => {
      if (newSocket) {
        newSocket.emit('leave_room', missionId);
        newSocket.disconnect();
      }
    };
  }, [missionId]); // Re-run effect if missionId changes

  return { leaderboard, error, isLoading: !data && !error };
}; 