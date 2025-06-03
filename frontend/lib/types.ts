export interface Mission {
  id: string;
  name: string;
  tactics: string;
  imageUrl?: string;
  createdAt: string;
  bestLapTime?: number; // Time in seconds
  simulations?: Simulation[];
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
  tactics: string;
  imageUrl?: string;
}