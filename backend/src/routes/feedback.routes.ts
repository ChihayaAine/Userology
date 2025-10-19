import { Router } from 'express';
import { submitFeedback } from '@/controllers/feedback.controller';

const router = Router();

router.post('/feedback', submitFeedback);

export default router;
