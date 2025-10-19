import { Router } from 'express';
import { 
  createInterview, 
  getAllInterviews, 
  getInterviewById, 
  updateInterview, 
  deleteInterview 
} from '@/controllers/interviews.controller';

const router = Router();

router.get('/', getAllInterviews);
router.post('/', createInterview);
router.get('/:id', getInterviewById);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

export default router;
