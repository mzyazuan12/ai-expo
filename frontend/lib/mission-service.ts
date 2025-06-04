import { CreateMissionData, Mission } from "@/lib/types";

// Mock data for demonstration
const MOCK_MISSIONS: Mission[] = [
  {
    id: "mission-001",
    name: "Serpentine Canyon Run",
    tactics: "Maintain tight turns through canyon walls. Keep altitude below 10m to avoid radar detection. Execute barrel roll at checkpoint 3 for style points.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    bestLapTime: 68.423,
    imageUrl: "https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "mission-002",
    name: "Urban Precision Course",
    tactics: "Navigate between buildings at max speed. Drop altitude at bend 4 to pass under the bridge. Maintain precision around light poles in the final sector.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    bestLapTime: 42.198,
  },
  {
    id: "mission-003",
    name: "Forest Slalom Challenge",
    tactics: "Weave between trees at high speed. Use the clearing for maximum acceleration. Watch for hanging branches in sector 2.",
    imageUrl: "https://images.pexels.com/photos/34153/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

// Utility to generate a random mission name
const generateMissionName = (): string => {
  const adjectives = [
    "Swift", "Rapid", "Precision", "Tactical", "Extreme", 
    "Serpentine", "Dynamic", "Agile", "Stealth", "Acrobatic"
  ];
  
  const nouns = [
    "Canyon", "Circuit", "Course", "Slalom", "Challenge", 
    "Run", "Dash", "Sprint", "Maneuver", "Path"
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${randomAdjective} ${randomNoun}`;
};

// API function to get missions
export async function getMissions(): Promise<Mission[]> {
  try {
    const response = await fetch('/api/missions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch missions: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching missions:', error);
    throw error;
  }
}

// API function to create a mission
export async function createMission(data: CreateMissionData): Promise<Mission> {
  try {
    const response = await fetch('/api/forge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        thread_text: data.tactics,
        meta: {
          terrain: data.environment,
          threats: [],
          wind_kts: 0,
          laps: 1,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
          trl: data.trl,
          urgency: data.urgency,
          domain: data.domain,
          gates: []
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create mission: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating mission:', error);
    throw error;
  }
}

// API function to get a single mission
export async function getMission(id: string): Promise<Mission> {
  try {
    const response = await fetch(`/api/missions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch mission: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching mission:', error);
    throw error;
  }
}

// API function to upvote a mission
export async function upvoteMission(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/missions/${id}/upvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to upvote mission: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error upvoting mission:', error);
    throw error;
  }
}

// API function to start simulation
export async function startSimulation(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/simulate/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to start simulation: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error starting simulation:', error);
    throw error;
  }
}