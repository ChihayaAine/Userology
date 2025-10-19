import { apiClient } from './api';
import { FeedbackData } from '@/types/response';

const submitFeedback = async (feedbackData: FeedbackData) => {
  try {
    const response = await apiClient.post('/feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

export const FeedbackService = {
  submitFeedback,
};
