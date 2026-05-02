export type ActivityType = 'mood' | 'goal' | 'system';
export type FilterType = 'all' | 'mood' | 'goal' | 'system';

export interface HistoryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  timestamp: Date;
  type: ActivityType;
  icon: React.ReactNode;
  color: string;
}
