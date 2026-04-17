export type MoodType = 'Happy' | 'Peaceful' | 'Calm' | 'Stressed' | 'Neutral' | 'Sad';

export interface MoodEntry {
  id?: string;
  mood: MoodType;
  note?: string;
  timestamp: Date;
  email: string;
}
