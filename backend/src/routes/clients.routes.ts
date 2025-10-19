import { Router } from 'express';
import { 
  updateOrganization, 
  getClientById, 
  getOrganizationById 
} from '@/controllers/clients.controller';

const router = Router();

// Organization routes
router.put('/organizations/:id', updateOrganization);
router.get('/organizations/:id', getOrganizationById);

// Client routes
router.get('/clients/:id', getClientById);

export default router;
