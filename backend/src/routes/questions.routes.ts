import { Router } from 'express';
import {
  generateInterviewQuestions,
  generateInterviewSessions,
  localizeOutline
} from '@/controllers/questions.controller';

const router = Router();

// 所有路由都挂载在 /api 下
router.post('/generate-interview-questions', generateInterviewQuestions);
router.post('/generate-interview-sessions', generateInterviewSessions);
router.post('/localize-outline', localizeOutline);

export default router;
