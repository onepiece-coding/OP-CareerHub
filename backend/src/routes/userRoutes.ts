import { Router } from 'express';
import {
  getAllUsersCtrl,
  updateUserCtrl,
  deleteAllUsersCtrl,
  deleteUserCtrl,
  getSingleUserCtrl,
  profilePhotoUploadCtrl,
  resumeUploadCtrl,
} from '../controllers/userController.js';
import { validateUpdateUser } from '../validations/userValidations.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';
import validateObjectIdParam from '../middlewares/validateObjectId.js';
import { singleImage, singlePDF } from '../middlewares/fileUpload.js';
import validate from '../middlewares/validate.js';

const userRoutes = Router();

// /api/v1/users
userRoutes
  .route('/')
  .all(authenticateUser, authorizeRoles('admin'))
  .get(getAllUsersCtrl)
  .delete(deleteAllUsersCtrl);

// /api/v1/users/:id
userRoutes
  .route('/:id')
  .all(validateObjectIdParam('id'), authenticateUser)
  .get(authorizeRoles('admin'), getSingleUserCtrl)
  .patch(validate(validateUpdateUser), updateUserCtrl)
  .delete(authorizeRoles('admin'), deleteUserCtrl);

// /api/v1/users/profile/resume-upload
userRoutes
  .route('/profile/resume-upload')
  .post(authenticateUser, singlePDF('pdf'), resumeUploadCtrl);

// /api/v1/users/profile/profile-photo-upload
userRoutes
  .route('/profile/profile-photo-upload')
  .post(authenticateUser, singleImage('image'), profilePhotoUploadCtrl);

export default userRoutes;
