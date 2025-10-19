import { Router } from 'express';
import { 
  createResponse, 
  getAllResponses, 
  getResponseByCallId, 
  updateResponse, 
  deleteResponse,
  responseWebhook,
  getEmailsForInterview
} from '@/controllers/responses.controller';

const router = Router();

router.post('/', createResponse);
router.get('/interview/:interviewId', getAllResponses);
router.get('/emails/:interviewId', getEmailsForInterview);
router.get('/call/:callId', getResponseByCallId);
router.put('/call/:callId', updateResponse);
router.delete('/call/:callId', deleteResponse);
router.post('/webhook', responseWebhook);

export default router;
