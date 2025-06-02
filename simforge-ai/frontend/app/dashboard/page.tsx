'use client';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

type Mission = {
  mission_name: string;
  created: string;
  scores: { pilot: string; lap_time_sec: number }[];
};

const socket = io(process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:8000');

export default function Dashboard() {
  const [thread, setThread] = useState('');
  const [image, setImage] = useState('');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [leaderboard, setLeaderboard] = useState<{pilot:string;lap:number}[]>([]);

  useEffect(() => {
    fetch('/api/missions').then(res => res.json()).then(setMissions);
    socket.on('score_update', (data) => {
      setLeaderboard(lb => [...lb, {pilot: data.pilot, lap: data.lap_time_sec}]);
    });
  }, []);

  const forge = async () => {
    await fetch('/api/forge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thread_text: thread, image_url: image || null })
    });
    setThread('');
    setImage('');
    fetch('/api/missions').then(res => res.json()).then(setMissions);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">SimForge Dashboard</h1>
      <textarea className="w-full p-2 border" rows={4} value={thread} onChange={e => setThread(e.target.value)} placeholder="Paste tactics thread..." />
      <input className="w-full p-2 border" value={image} onChange={e => setImage(e.target.value)} placeholder="Image URL (optional)" />
      <button className="px-4 py-2 bg-blue-600 text-white" onClick={forge}>Forge</button>
      <h2 className="font-semibold">Mission History</h2>
      <ul>
        {missions.map(m => (
          <li key={m.mission_name}>{m.mission_name} - {new Date(m.created).toLocaleString()}</li>
        ))}
      </ul>
      <h2 className="font-semibold">Leaderboard</h2>
      <ul>
        {leaderboard.map((s,i) => (
          <li key={i}>{s.pilot}: {s.lap.toFixed(2)}s</li>
        ))}
      </ul>
    </div>
  );
}
