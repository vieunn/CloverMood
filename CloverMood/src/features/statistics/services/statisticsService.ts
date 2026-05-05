import type { StatisticsData } from '../types';
import { getAuthHeaders } from '../../../shared/utils/api';
import { API_CONFIG } from '../../../config/api';

export const statisticsService = {
  getStatistics: async (userId: string): Promise<StatisticsData> => {
    const response = await fetch(API_CONFIG.STATISTICS.GET(userId), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return response.json();
  },
};
