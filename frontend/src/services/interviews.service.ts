import { apiClient } from './api';

const getAllInterviews = async (userId: string, organizationId: string) => {
  try {
    const response = await apiClient.get('/interviews', {
      params: { userId, organizationId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return [];
  }
};

const getInterviewById = async (id: string) => {
  try {
    const response = await apiClient.get(`/interviews/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching interview:', error);
    return null;
  }
};

const updateInterview = async (payload: any, id: string) => {
  try {
    const response = await apiClient.put(`/interviews/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating interview:', error);
    return [];
  }
};

const deleteInterview = async (id: string) => {
  try {
    const response = await apiClient.delete(`/interviews/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting interview:', error);
    return [];
  }
};

const createInterview = async (interviewData: any, organizationName?: string) => {
  try {
    const payload = {
      interviewData,
      organizationName
    };
    const response = await apiClient.post('/interviews', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating interview:', error);
    throw error;
  }
};

const deactivateInterviewsByOrgId = async (organizationId: string) => {
  try {
    // This might need to be implemented as a specific endpoint
    const response = await apiClient.put(`/interviews/deactivate/${organizationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deactivating interviews:', error);
  }
};

export const InterviewService = {
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  createInterview,
  deactivateInterviewsByOrgId,
};
