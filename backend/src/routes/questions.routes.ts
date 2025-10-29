import { Router } from 'express';
import {
  generateInterviewQuestions,
  generateInterviewSessions,
  localizeOutline,
  generateOutlineSkeleton,
  updateOutlineSkeleton,
  generateFullOutlineFromSkeleton
} from '@/controllers/questions.controller';

const router = Router();

// 所有路由都挂载在 /api 下
router.post('/generate-interview-questions', generateInterviewQuestions);
router.post('/generate-interview-sessions', generateInterviewSessions);
router.post('/localize-outline', localizeOutline);

// Two-step outline generation routes
router.post('/outlines/skeleton', generateOutlineSkeleton);
router.patch('/outlines/:id/skeleton', updateOutlineSkeleton);
router.post('/outlines/:id/full-outline', generateFullOutlineFromSkeleton);

export default router;
