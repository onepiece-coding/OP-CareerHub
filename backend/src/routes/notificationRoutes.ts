import { Router } from 'express';
import {
  getNotificationsCtrl,
  markNotificationAsReadCtrl,
  deleteNotificationCtrl,
} from '../controllers/notificationController.js';
import { authenticateUser } from '../middlewares/auth.js';
import validateObjectIdParam from '../middlewares/validateObjectId.js';

const notificationRoutes = Router();

notificationRoutes.use(authenticateUser);

//  /api/v1/notifications
notificationRoutes.get('/', getNotificationsCtrl);

//  /api/v1/notifications/:id
notificationRoutes
  .route('/:id')
  .all(validateObjectIdParam('id'))
  .patch(markNotificationAsReadCtrl)
  .delete(deleteNotificationCtrl);

export default notificationRoutes;
