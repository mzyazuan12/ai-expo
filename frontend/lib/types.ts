import { z } from 'zod';

export interface Mission {
  _id: string;
  mission_name: string;
  thread_text: string;
  imageUrl?: string;
  meta: {
    terrain: string;
    threats: string[];
    wind_kts: number;
    laps: number;
    tags: string[];
    trl: number;
    urgency: string;
    domain: string;
    environment: string;
    is_anonymous: boolean;
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
  mission_name: string;
  thread_text: string;
  imageUrl?: string;
  tags?: string[];
  meta: {
    trl: number;
    urgency: string;
    domain: string;
    environment: string;
    threats?: string[];
    wind_kts: number;
    laps: number;
    is_anonymous: boolean;
  };
}

export interface Challenge {
  _id: string;
  title: string;
  body_md: string;
  tags: string[];
  trl: number;
  urgency: string;
  domain: string;
  state: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
  redactions: string[];
  author_uid: string;
  author_name?: string;
  is_anonymous: boolean;
  created: string;
  updated: string;
  upvotes: number;
  video_url?: string;
  solutions: Solution[];
  moderators: string[];
  review_notes?: string;
  classification_level?: 'unclassified' | 'confidential' | 'secret' | 'top_secret';
  verification_required: boolean;
  allowed_provider_types?: ('academia' | 'startup' | 'industry')[];
  required_clearance_level?: 'unclassified' | 'confidential' | 'secret' | 'top_secret';
}

export interface Solution {
  _id: string;
  challenge_id: string;
  provider_id: string;
  provider_name: string;
  provider_type: 'academia' | 'startup' | 'industry' | 'government';
  provider_details: {
    institution_name?: string;
    department?: string;
    website?: string;
    expertise_areas?: string[];
    trl_capabilities?: number[];
  };
  content: string;
  trl: number;
  video_url?: string;
  attachments: string[];
  created: string;
  updated: string;
  upvotes: number;
  status: 'pending_review' | 'approved' | 'rejected';
  review_notes?: string;
  is_anonymous: boolean;
}

export interface User {
  _id: string;
  uid: string;
  email: string;
  name: string;
  organization: string;
  role: 'warfighter' | 'academia' | 'startup' | 'industry' | 'moderator' | 'admin';
  clearance_level?: 'unclassified' | 'confidential' | 'secret' | 'top_secret';
  dod_verified: boolean;
  verification_date?: string;
  verification_method?: 'cac' | 'email' | 'manual';
  provider_details?: {
    type: 'academia' | 'startup' | 'industry';
    institution_name?: string;
    department?: string;
    website?: string;
    expertise_areas?: string[];
    trl_capabilities?: number[];
  };
  created: string;
  updated: string;
}

export interface SearchFilters {
  query?: string;
  tags?: string[];
  trl?: number[];
  urgency?: string[];
  domain?: string[];
  classification_level?: string[];
  provider_type?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  sort_by?: 'relevance' | 'date' | 'upvotes';
  sort_order?: 'asc' | 'desc';
}

export const challengeFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(20, "Description must be at least 20 characters long"),
  trl: z.number().min(1).max(9),
  urgency: z.enum(["critical", "high", "medium", "low"]),
  classification_level: z.enum(["unclassified", "confidential", "secret", "top_secret"]),
  domain: z.string().min(1, "Domain is required"),
  environment: z.string().min(1, "Environment is required"),
  threats: z.string().optional(),
  wind_kts: z.number().min(0).max(100).optional(),
  laps: z.number().min(1).max(100).optional(),
  tags: z.string().optional(),
  is_anonymous: z.boolean().default(false),
  video_url: z.string().url().optional(),
});

export type ChallengeFormData = z.infer<typeof challengeFormSchema>;