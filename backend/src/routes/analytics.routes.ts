import { Router } from 'express';
import {
  generateInsights,
  generateAnalytics,
  generateInterviewSummary,
  regenerateInterviewSummary
} from '@/controllers/analytics.controller';

const router = Router();

router.post('/insights', generateInsights);
router.post('/generate', generateAnalytics);
router.post('/summary', generateInterviewSummary);
router.post('/summary/regenerate/:callId', regenerateInterviewSummary);

export default router;
