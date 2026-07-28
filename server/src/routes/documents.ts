import { Router } from 'express';
import * as documentController from '../controllers/documentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', documentController.listDocuments);
router.get('/:id', documentController.getDocument);
router.post('/', documentController.createDocument);
router.put('/:id', documentController.updateDocument);
router.patch('/:id/rename', documentController.renameDocument);
router.delete('/:id', documentController.deleteDocument);

export default router;
