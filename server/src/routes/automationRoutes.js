import { Router } from 'express';
import { processPullRequest } from '../controllers/automationController.js';
const router = Router();
router.post('/process-pr', processPullRequest);
export default router;
