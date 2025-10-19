import { Router } from 'express';
import { createInterviewer, getAllInterviewers, getInterviewer, updateInterviewerLanguage } from '@/controllers/interviewers.controller';

const router = Router();

router.get('/', getAllInterviewers);
router.get('/create', createInterviewer);
router.get('/:id', getInterviewer);
router.post('/update-language', updateInterviewerLanguage);

export default router;
