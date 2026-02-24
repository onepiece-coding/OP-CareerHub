import { Router } from 'express';
import {
  registerUserCtrl,
  loginUserCtrl,
  getMeCtrl,
  verifyUserAccountCtrl,
  refreshTokenCtrl,
  logoutCtrl,
} from '../controllers/authController.js';
import { authenticateUser } from '../middlewares/auth.js';
import validateObjectIdParam from '../middlewares/validateObjectId.js';
import { validate } from '../middlewares/validate.js';
import {
  validateLoginUser,
  validateRegisterUser,
} from '../validations/userValidations.js';

const authRoutes = Router();

// /api/v1/auth/register
authRoutes.post('/register', validate(validateRegisterUser), registerUserCtrl);

// /api/v1/auth/login
authRoutes.post('/login', validate(validateLoginUser), loginUserCtrl);

// /api/v1/auth/me
authRoutes.get('/me', authenticateUser, getMeCtrl);

// /api/v1/auth/:userId/verify/:token
authRoutes.get(
  '/:userId/verify/:token',
  validateObjectIdParam('userId'),
  verifyUserAccountCtrl,
);

// /api/v1/auth/refresh
authRoutes.post('/refresh', refreshTokenCtrl);

// /api/v1/auth/logout
authRoutes.post('/logout', authenticateUser, logoutCtrl);

export default authRoutes;
