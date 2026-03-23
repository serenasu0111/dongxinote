import { Router } from 'express';
import * as searchController from '../controllers/searchController';
import * as aiController from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/notes', authMiddleware, searchController.searchNotes);
router.get('/timeline', authMiddleware, searchController.getTimeline);
router.post('/ai/chat', authMiddleware, aiController.askAI);

export default router;
