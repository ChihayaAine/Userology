import { Router } from 'express';
import { generateInsights, generateAnalytics } from '@/controllers/analytics.controller';

const router = Router();

router.post('/insights', generateInsights);
router.post('/generate', generateAnalytics);

export default router;
