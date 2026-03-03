import { Router } from 'express';
import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import jobRoutes from './jobRoutes.js';
import userRoutes from './userRoutes.js';
import passwordRoutes from './passwordRoutes.js';

const rootRouter: Router = Router();

rootRouter.use('/admin', adminRoutes);
rootRouter.use('/auth', authRoutes);
rootRouter.use('/notifications', notificationRoutes);
rootRouter.use('/password', passwordRoutes);
rootRouter.use('/applications', applicationRoutes);
rootRouter.use('/jobs', jobRoutes);
rootRouter.use('/users', userRoutes);

export default rootRouter;
