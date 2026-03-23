import { Router } from 'express';
import * as noteController from '../controllers/noteController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, noteController.createNote);
router.get('/', authMiddleware, noteController.getNotes);
router.get('/date', authMiddleware, noteController.getNotesByDate);
router.get('/:id', authMiddleware, noteController.getNote);
router.put('/:id', authMiddleware, noteController.updateNote);
router.delete('/:id', authMiddleware, noteController.deleteNote);
router.get('/:id/related', authMiddleware, noteController.getRelatedNotes);

export default router;
