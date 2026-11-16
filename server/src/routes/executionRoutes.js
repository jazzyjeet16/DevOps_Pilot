import { Router } from 'express';
import { getStats, listExecutions } from '../controllers/executionController.js';
import { protect } from '../middleware/auth.js';
const router = Router();
router.use(protect);
router.get('/stats', getStats);
router.get('/', listExecutions);
export default router;
