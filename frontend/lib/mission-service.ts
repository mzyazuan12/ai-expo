import { CreateMissionData, Mission } from "@/lib/types";
import { ObjectId } from "mongodb";

// Mock data for demonstration
const MOCK_MISSIONS: Mission[] = [
  {
    _id: "mission-001",
    mission_name: "Serpentine Canyon Run",
    thread_text: "Maintain tight turns through canyon walls. Keep altitude below 10m to avoid radar detection. Execute barrel roll at checkpoint 3 for style points.",
    created: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    imageUrl: "https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    meta: {
      terrain: "canyon",
      threats: ["radar"],
      wind_kts: 15,
      laps: 3,
      tags: ["precision", "stealth"],
      trl: 7,
      urgency: "high",
      domain: "military",
      environment: "canyon",
      is_anonymous: false
    },
    scores: [],
    upvotes: 0
  },
  {
    _id: "mission-002",
    mission_name: "Urban Precision Course",
    thread_text: "Navigate between buildings at max speed. Drop altitude at bend 4 to pass under the bridge. Maintain precision around light poles in the final sector.",
    created: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    meta: {
      terrain: "urban",
      threats: ["obstacles"],
      wind_kts: 10,
      laps: 5,
      tags: ["urban", "precision"],
      trl: 6,
      urgency: "medium",
      domain: "civilian",
      environment: "urban",
      is_anonymous: false
    },
    scores: [],
    upvotes: 0
  },
  {
    _id: "mission-003",
    mission_name: "Forest Slalom Challenge",
    thread_text: "Weave between trees at high speed. Use the clearing for maximum acceleration. Watch for hanging branches in sector 2.",
    imageUrl: "https://images.pexels.com/photos/34153/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    created: new Date(Date.now() - 3600000 * 12).toISOString(),
    meta: {
      terrain: "forest",
      threats: ["trees", "branches"],
      wind_kts: 5,
      laps: 4,
      tags: ["forest", "slalom"],
      trl: 5,
      urgency: "low",
      domain: "training",
      environment: "forest",
      is_anonymous: false
    },
    scores: [],
    upvotes: 0
  }
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

// Utility to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  // 24 hex characters
  return /^[a-f\d]{24}$/i.test(id);
}

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
    return data.map((mission: any) => ({
      ...mission,
      _id: mission._id.toString(),
    }));
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
        ...data,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
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
    return {
      ...data,
      _id: data._id.toString(),
    };
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

// API function to start a simulation
export async function startSimulation(missionId: string): Promise<void> {
  if (!isValidObjectId(missionId)) {
    console.warn(`startSimulation called with non-ObjectId: ${missionId}`);
    throw new Error('Invalid mission ID: not a MongoDB ObjectId');
  }
  try {
    const response = await fetch(`/api/missions/${missionId}/simulate`, {
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