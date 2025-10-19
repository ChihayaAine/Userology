import { Router } from 'express';
import { generateInterviewQuestions, generateInterviewSessions } from '@/controllers/questions.controller';

const router = Router();

router.post('/generate-interview-questions', generateInterviewQuestions);
router.post('/generate-interview-sessions', generateInterviewSessions);

export default router;
