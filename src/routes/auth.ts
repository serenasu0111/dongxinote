import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/settings', authMiddleware, authController.updateSettings);

export default router;
