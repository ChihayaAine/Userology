import { Router } from 'express';
import { createInterviewer, getAllInterviewers, getInterviewer } from '@/controllers/interviewers.controller';

const router = Router();

router.get('/', getAllInterviewers);
router.get('/create', createInterviewer);
router.get('/:id', getInterviewer);

export default router;
