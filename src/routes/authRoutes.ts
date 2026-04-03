import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  setup2FA,
  verify2FA,
  disable2FA,
  login2FA,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// 2FA Routes
router.get('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/verify', authenticate, verify2FA);
router.post('/2fa/disable', authenticate, disable2FA);
router.post('/2fa/login', login2FA);

export default router;
