import { apiClient } from './api';

const generateInsights = async (interviewId: string) => {
  try {
    const response = await apiClient.post('/analytics/insights', {
      interviewId
    });
    return response.data;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
};

const generateAnalytics = async (payload: {
  callId: string;
  interviewId: string;
  transcript: string;
}) => {
  try {
    const response = await apiClient.post('/analytics/generate', payload);
    return response.data;
  } catch (error) {
    console.error('Error generating analytics:', error);
    throw error;
  }
};

export const AnalyticsService = {
  generateInsights,
  generateAnalytics,
};
