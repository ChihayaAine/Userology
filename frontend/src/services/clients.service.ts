import { apiClient } from './api';

const updateOrganization = async (payload: any, id: string) => {
  try {
    const response = await apiClient.put(`/organizations/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating organization:', error);
    return [];
  }
};

const getClientById = async (
  id: string,
  email?: string | null,
  organization_id?: string | null,
) => {
  try {
    const response = await apiClient.get(`/clients/${id}`, {
      params: { email, organization_id }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching client:', error);
    return [];
  }
};

const getOrganizationById = async (
  organization_id?: string,
  organization_name?: string,
) => {
  try {
    const response = await apiClient.get(`/organizations/${organization_id}`, {
      params: { organization_name }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return [];
  }
};

export const ClientService = {
  updateOrganization,
  getClientById,
  getOrganizationById,
};
