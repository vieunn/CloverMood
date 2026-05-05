export interface MoodStats {
  mood: string;
  count: number;
  percentage: number;
}

export interface DayData {
  day: string;
  count: number;
}

export interface WeekData {
  week: string;
  count: number;
}

export interface StatisticsData {
  most_frequent_mood: MoodStats;
  weekly_overview: DayData[];
  monthly_overview: WeekData[];
  total_entries: number;
  day_streak: number;
}
