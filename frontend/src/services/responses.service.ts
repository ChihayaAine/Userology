import { apiClient } from './api';

const createResponse = async (payload: any) => {
  try {
    const response = await apiClient.post('/responses', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating response:', error);
    return [];
  }
};

const saveResponse = async (payload: any, call_id: string) => {
  try {
    const response = await apiClient.put(`/responses/call/${call_id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error saving response:', error);
    return [];
  }
};

const getAllResponses = async (interviewId: string) => {
  try {
    const response = await apiClient.get(`/responses/interview/${interviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching responses:', error);
    return [];
  }
};

const getResponseCountByOrganizationId = async (
  organizationId: string,
): Promise<number> => {
  try {
    // This might need a specific endpoint
    const response = await apiClient.get(`/responses/count/${organizationId}`);
    return response.data.count ?? 0;
  } catch (error) {
    console.error('Error fetching response count:', error);
    return 0;
  }
};

const getAllEmailAddressesForInterview = async (interviewId: string) => {
  try {
    const response = await apiClient.get(`/responses/emails/${interviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
};

const getResponseByCallId = async (id: string) => {
  try {
    const response = await apiClient.get(`/responses/call/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching response by call id:', error);
    return [];
  }
};

const deleteResponse = async (id: string) => {
  try {
    const response = await apiClient.delete(`/responses/call/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting response:', error);
    return [];
  }
};

const updateResponse = async (payload: any, call_id: string) => {
  try {
    const response = await apiClient.put(`/responses/call/${call_id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating response:', error);
    return [];
  }
};

export const ResponseService = {
  createResponse,
  saveResponse,
  updateResponse,
  getAllResponses,
  getResponseByCallId,
  deleteResponse,
  getResponseCountByOrganizationId,
  getAllEmails: getAllEmailAddressesForInterview,
};
