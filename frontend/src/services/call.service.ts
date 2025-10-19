import { apiClient } from './api';

const registerCall = async (interviewer_id: string, dynamic_data: any) => {
  try {
    const response = await apiClient.post('/call/register', {
      interviewer_id,
      dynamic_data
    });
    return response.data;
  } catch (error) {
    console.error('Error registering call:', error);
    throw error;
  }
};

const getCall = async (callId: string) => {
  try {
    const response = await apiClient.get(`/call/${callId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching call:', error);
    return null;
  }
};

export const CallService = {
  registerCall,
  getCall,
};
