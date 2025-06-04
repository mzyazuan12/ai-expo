import { Challenge, Solution, SearchFilters } from "@/lib/types";

const API_BASE_URL = "/api";

// API function to get challenges with filters
export async function getChallenges(filters?: {
  state?: string;
  domain?: string;
  urgency?: string;
}): Promise<Challenge[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.state) queryParams.append("state", filters.state);
    if (filters?.domain) queryParams.append("domain", filters.domain);
    if (filters?.urgency) queryParams.append("urgency", filters.urgency);

    const response = await fetch(`${API_BASE_URL}/challenges?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch challenges");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching challenges:", error);
    throw error;
  }
}

// API function to get a single challenge
export async function getChallenge(id: string): Promise<Challenge> {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch challenge");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching challenge:", error);
    throw error;
  }
}

// API function to create a challenge
export async function createChallenge(data: ChallengeFormData): Promise<Challenge> {
  try {
    const processedData = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []),
      video_url: data.video_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const response = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(processedData),
    });

    if (!response.ok) {
      throw new Error("Failed to create challenge");
    }

    return response.json();
  } catch (error) {
    console.error("Error creating challenge:", error);
    throw error;
  }
}

// API function to submit a solution
export async function submitSolution(challengeId: string, solution: {
  title: string;
  description: string;
  code?: string;
  attachments?: string[];
}): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/solutions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(solution),
    });

    if (!response.ok) {
      throw new Error("Failed to submit solution");
    }
  } catch (error) {
    console.error("Error submitting solution:", error);
    throw error;
  }
}

// API function to upvote a challenge
export async function upvoteChallenge(id: string): Promise<Challenge> {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}/upvote`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to upvote challenge");
    }

    return response.json();
  } catch (error) {
    console.error("Error upvoting challenge:", error);
    throw error;
  }
}

// API function to update challenge state (for moderators)
export async function updateChallengeState(id: string, state: Challenge['state'], notes?: string): Promise<Challenge> {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}/state`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state, review_notes: notes }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update challenge state: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating challenge state:', error);
    throw error;
  }
}

// API function to get similar challenges
export async function getSimilarChallenges(id: string): Promise<Challenge[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}/similar`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch similar challenges: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching similar challenges:', error);
    throw error;
  }
}

// API function to upload a video
export async function uploadVideo(file: File): Promise<{ url: string }> {
  try {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch('/api/upload/video', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload video: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
} 