'use client';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Mission {
  mission_name: string;
  created: string;
  meta: {
    terrain: string;
    threats: string[];
    wind_kts: number;
    laps: number;
  };
  scores: Array<{
    pilot: string;
    lap_time_sec: number;
    timestamp: string;
  }>;
}

export default function Dashboard() {
  const [threadId, setThreadId] = useState('');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch initial missions
    fetchMissions();

    // Setup socket.io
    const socket = io('http://localhost:8000');
    socket.on('score_update', () => {
      fetchMissions();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await fetch('http://localhost:8000/missions');
      const data = await res.json();
      setMissions(data);
    } catch (err) {
      console.error('Failed to fetch missions:', err);
    }
  };

  const handleForge = async () => {
    if (!threadId) {
      setError('Please enter a thread ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_text: threadId }),
      });

      if (!res.ok) {
        throw new Error('Failed to forge mission');
      }

      await fetchMissions();
      setThreadId('');
    } catch (err) {
      setError('Failed to forge mission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mission Forge</h1>

      <div className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={threadId}
            onChange={(e) => setThreadId(e.target.value)}
            placeholder="Enter thread ID"
            className="flex-1 rounded-lg border p-2"
          />
          <button
            onClick={handleForge}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              'Forge Mission'
            )}
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Missions</h2>
          <div className="space-y-4">
            {missions.map((mission) => (
              <div
                key={mission.mission_name}
                className="bg-white p-4 rounded-lg shadow"
              >
                <h3 className="font-semibold">{mission.mission_name}</h3>
                <p className="text-sm text-gray-600">
                  Terrain: {mission.meta.terrain}
                </p>
                <p className="text-sm text-gray-600">
                  Wind: {mission.meta.wind_kts} kts
                </p>
                <p className="text-sm text-gray-600">
                  Laps: {mission.meta.laps}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Pilot</th>
                  <th className="px-4 py-2 text-left">Mission</th>
                  <th className="px-4 py-2 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {missions.flatMap((mission) =>
                  mission.scores.map((score, i) => (
                    <tr key={`${mission.mission_name}-${i}`} className="border-t">
                      <td className="px-4 py-2">{score.pilot}</td>
                      <td className="px-4 py-2">{mission.mission_name}</td>
                      <td className="px-4 py-2">
                        {score.lap_time_sec.toFixed(2)}s
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
