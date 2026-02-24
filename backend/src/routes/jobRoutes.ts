import { Router } from "express";
import {
  getAllJobsCtrl,
  getMyJobsCtrl,
  getSingleJobCtrl,
  addJobCtrl,
  updateSingleJobCtrl,
  deleteSingleJobCtrl,
  deleteAllJobsCtrl,
} from "../controllers/jobController.js";
import {
  validateAddJob,
  validateUpdateJob,
} from "../validations/jobValidations.js";

import { authenticateUser, authorizeRoles } from "../middlewares/auth.js";
import validateObjectIdParam from "../middlewares/validateObjectId.js";
import validate from "../middlewares/validate.js";

const jobRoutes = Router();

// /api/v1/jobs
jobRoutes
  .route("/")
  .get(getAllJobsCtrl)
  .post(
    authenticateUser,
    authorizeRoles("recruiter"),
    validate(validateAddJob),
    addJobCtrl,
  )
  .delete(authenticateUser, authorizeRoles("admin"), deleteAllJobsCtrl);

// /api/v1/jobs/my-jobs
jobRoutes.get(
  "/my-jobs",
  authenticateUser,
  authorizeRoles("recruiter"),
  getMyJobsCtrl,
);

// /api/v1/jobs/:id
jobRoutes
  .route("/:id")
  .all(validateObjectIdParam("id"))
  .get(getSingleJobCtrl)
  .patch(
    authenticateUser,
    authorizeRoles("recruiter"),
    validate(validateUpdateJob),
    updateSingleJobCtrl,
  )
  .delete(authenticateUser, authorizeRoles("recruiter"), deleteSingleJobCtrl);

export default jobRoutes;
