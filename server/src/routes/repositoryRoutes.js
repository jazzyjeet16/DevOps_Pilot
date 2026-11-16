import { Router } from 'express';
import { addRepository, listRepositories, removeRepository } from '../controllers/repositoryController.js';
import { protect } from '../middleware/auth.js';
const router = Router();
router.use(protect);
router.get('/', listRepositories);
router.post('/', addRepository);
router.delete('/:id', removeRepository);
export default router;
