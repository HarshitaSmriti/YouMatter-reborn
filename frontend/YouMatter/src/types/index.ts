export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  score: number;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter?: number;
  rounds: number;
}

export interface LabReportSummary {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  summary?: string;
  flagged_items?: FlaggedItem[];
  created_at: string;
  updated_at: string;
}

export interface FlaggedItem {
  name: string;
  value: string;
  reference_range: string;
  status: 'high' | 'low' | 'normal';
  explanation: string;
}

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const MOODS = [
  { label: "Happy", value: "happy", emoji: "😊" },
  { label: "Sad", value: "sad", emoji: "😢" },
  { label: "Angry", value: "angry", emoji: "😠" },
  { label: "Anxious", value: "anxious", emoji: "😰" },
  { label: "Neutral", value: "neutral", emoji: "😐" },
];

export const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  { id: 'box', name: 'Box Breathing', description: 'Equal counts for calm focus', inhale: 4, hold: 4, exhale: 4, holdAfter: 4, rounds: 4 },
  { id: '478', name: '4-7-8 Relaxing', description: 'Deep relaxation technique', inhale: 4, hold: 7, exhale: 8, rounds: 4 },
  { id: 'calm', name: 'Calming Breath', description: 'Simple slow breathing', inhale: 4, hold: 2, exhale: 6, rounds: 6 },
];
