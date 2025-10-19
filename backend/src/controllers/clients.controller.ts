import { Request, Response } from 'express';
import { ClientService } from '@/services/clients.service';

export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    const result = await ClientService.updateOrganization(payload, id);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({
      error: "Failed to update organization"
    });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, organization_id } = req.query;
    
    const client = await ClientService.getClientById(
      id, 
      email as string, 
      organization_id as string
    );
    
    res.status(200).json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({
      error: "Failed to fetch client"
    });
  }
};

export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organization_name } = req.query;
    
    const organization = await ClientService.getOrganizationById(
      id, 
      organization_name as string
    );
    
    res.status(200).json(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({
      error: "Failed to fetch organization"
    });
  }
};
