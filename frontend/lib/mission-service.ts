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

// Mock API function to get missions
export async function getMissions(): Promise<Mission[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Return a copy of the mock data
  return [...MOCK_MISSIONS];
}

// Mock API function to create a mission
export async function createMission(data: CreateMissionData): Promise<Mission> {
  try {
    const response = await fetch('/api/forge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        thread_text: data.tactics
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create mission');
    }

    const result = await response.json();
    
    // Generate a new mission with the API response
    const newMission: Mission = {
      id: `mission-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      name: generateMissionName(),
      tactics: data.tactics,
      imageUrl: data.imageUrl,
      createdAt: new Date().toISOString(),
      bestLapTime: Math.random() > 0.3 ? undefined : 35 + Math.random() * 60,
      missionData: result.response // Add the mission data from the API
    };
    
    // Add to mock data
    MOCK_MISSIONS.unshift(newMission);
    
    return newMission;
  } catch (error) {
    console.error('Error creating mission:', error);
    throw error;
  }
}

// Mock API function to get a single mission
export async function getMission(id: string): Promise<Mission | undefined> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return MOCK_MISSIONS.find((mission) => mission.id === id);
}