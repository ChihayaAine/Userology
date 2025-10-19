import { apiClient } from './api';

const getAllInterviewers = async (clientId: string = "") => {
  try {
    console.log('🚀 Fetching interviewers from:', apiClient.defaults.baseURL + '/interviewers');
    console.log('🚀 Request params:', { clientId });
    
    const response = await apiClient.get('/interviewers', {
      params: { clientId }
    });
    
    console.log('✅ Interviewers response status:', response.status);
    console.log('✅ Interviewers response headers:', response.headers);
    console.log('✅ Interviewers response data:', response.data);
    console.log('✅ Data type:', typeof response.data, 'Array:', Array.isArray(response.data));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching interviewers:', error);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', error.response?.data);
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error object:', error);
    return [];
  }
};

const createInterviewer = async () => {
  try {
    const response = await apiClient.get('/interviewers/create');
    return response.data;
  } catch (error) {
    console.error('Error creating interviewer:', error);
    return null;
  }
};

const getInterviewer = async (interviewerId: string | bigint) => {
  try {
    const id = typeof interviewerId === 'bigint' ? interviewerId.toString() : interviewerId;
    console.log('🚀 Fetching single interviewer:', id);
    
    const response = await apiClient.get(`/interviewers/${id}`);
    
    console.log('✅ Single interviewer response:', response.data);
    console.log('✅ Image field:', response.data?.image);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching interviewer:', error);
    console.error('❌ Interviewer ID:', interviewerId);
    return null;
  }
};

export const InterviewerService = {
  getAllInterviewers,
  createInterviewer,
  getInterviewer,
};
