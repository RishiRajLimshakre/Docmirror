import { Router } from 'express';
import { passport } from '../config/passport.js';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);

// router.get(
//   '/google',
//   passport.authenticate('google', { scope: ['profile', 'email'], session: false })
// );

// router.get(
//   '/google/callback',
//   passport.authenticate('google', {
//     session: false,
//     failureRedirect: `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/login?error=google_failed`,
//   }),
//   authController.googleCallback
// );

export default router;
