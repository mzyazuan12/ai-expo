export interface Mission {
  _id: string;
  mission_name: string;
  meta: {
    terrain: string;
    threats: string[];
    wind_kts: number;
    laps: number;
    tags: string[];
    trl: number;
    urgency: string;
    domain: string;
  };
  created: string;
  scores: Array<{
    pilot: string;
    lap_time_sec: number;
  }>;
  upvotes: number;
}

export interface Simulation {
  id: string;
  missionId: string;
  startedAt: string;
  completedAt?: string;
  lapTimes: number[]; // Times in seconds
  bestLapTime?: number; // Time in seconds
  status: 'queued' | 'running' | 'completed' | 'failed';
}

export interface CreateMissionData {
  thread_text: string;
  image_url?: string;
}