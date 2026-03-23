import { Router } from 'express';
import * as inventoryController from '../controllers/inventoryController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, inventoryController.createInventory);
router.get('/', authMiddleware, inventoryController.getInventories);
router.get('/:id', authMiddleware, inventoryController.getInventory);
router.put('/:id', authMiddleware, inventoryController.updateInventory);
router.delete('/:id', authMiddleware, inventoryController.deleteInventory);
router.put('/:id/archive', authMiddleware, inventoryController.archiveInventory);
router.put('/:id/unarchive', authMiddleware, inventoryController.unarchiveInventory);

export default router;
