import { Router } from 'express';
import { registerCall, getCall } from '@/controllers/call.controller';

const router = Router();

router.post('/register', registerCall);
router.get('/:callId', getCall);

export default router;
