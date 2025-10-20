import { Router } from 'express';
import {
  generateInsights,
  generateAnalytics,
  generateInterviewSummary,
  regenerateInterviewSummary,
  generateStudySummary,
  regenerateStudySummary
} from '@/controllers/analytics.controller';

const router = Router();

router.post('/insights', generateInsights);
router.post('/generate', generateAnalytics);
router.post('/summary', generateInterviewSummary);
router.post('/summary/regenerate/:callId', regenerateInterviewSummary);
router.post('/study-summary', generateStudySummary);
router.post('/study-summary/regenerate/:interviewId', regenerateStudySummary);

export default router;
