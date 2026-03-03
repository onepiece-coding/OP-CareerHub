import { Router } from 'express';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';
import {
  getCandidateApplicationsCtrl,
  getRecruiterJobsApplicationsCtrl,
  applyInJobCtrl,
  updateApplicationStatusCtrl,
} from '../controllers/applicationController.js';
import {
  validateApplyInJob,
  validateUpdateApplication,
} from '../validations/applicationValidations.js';
import validateObjectIdParam from '../middlewares/validateObjectId.js';
import validate from '../middlewares/validate.js';

const applicationRoutes = Router();

// /api/v1/applications/applicant
applicationRoutes.get(
  '/applicant',
  authenticateUser,
  authorizeRoles('user'),
  getCandidateApplicationsCtrl,
);

// /api/v1/applications/apply
applicationRoutes.post(
  '/apply',
  authenticateUser,
  authorizeRoles('user'),
  validate(validateApplyInJob),
  applyInJobCtrl,
);

// /api/v1/applications/recruiter
applicationRoutes.get(
  '/recruiter',
  authenticateUser,
  authorizeRoles('recruiter'),
  getRecruiterJobsApplicationsCtrl,
);

// /api/v1/applications/:id
applicationRoutes.patch(
  '/:id',
  validateObjectIdParam('id'),
  authenticateUser,
  authorizeRoles('recruiter'),
  validate(validateUpdateApplication),
  updateApplicationStatusCtrl,
);

export default applicationRoutes;
