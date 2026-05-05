import type { StatisticsData } from '../types';

export const statisticsService = {
  getStatistics: async (userId: string, token: string): Promise<StatisticsData> => {
    const response = await fetch(`http://localhost:8080/api/statistics/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return response.json();
  },
};
