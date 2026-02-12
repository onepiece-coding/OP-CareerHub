const router = require("express").Router();
const { authenticateUser } = require("../middlewares/userAuthentication.js");
const {
  userAuthorizationHandler,
} = require("../middlewares/userAuthorization.js");
const {
  getCandidateAppliedJobs,
  getRecruiterPostJobs,
  applyInJob,
  updateApplicationStatus,
  filterApplicationsAI,
} = require("../controllers/applicationsController.js");
const { checkInput } = require("../validations/applicationDataRules.js");
const { inputValidation } = require("../validations/inputValidation.js");
const validateObjectId = require("../middlewares/validateObjectId.js");

// /api/v1/applications/applicant-jobs
router.get(
  "/applicant-jobs",
  authenticateUser,
  userAuthorizationHandler("user"),
  getCandidateAppliedJobs
);

// /api/v1/applications/apply
router.post(
  "/apply",
  authenticateUser,
  userAuthorizationHandler("user"),
  checkInput,
  inputValidation,
  applyInJob
);

// /api/v1/applications/recruiter-jobs
router.get(
  "/recruiter-jobs",
  authenticateUser,
  userAuthorizationHandler("recruiter"),
  getRecruiterPostJobs
);

// /api/v1/applications/recruiter-jobs/:jobId
// router.get(
//   "/recruiter-jobs/:jobId",
//   authenticateUser,
//   userAuthorizationHandler("recruiter"),
//   getRecruiterJobApplications
// );

// /api/v1/applications/:id
router.patch(
  "/:id",
  validateObjectId,
  authenticateUser,
  userAuthorizationHandler("recruiter"),
  updateApplicationStatus
);

// /api/v1/applications/ai-filter/:id
router.get(
  "/ai-filter/:id",
  validateObjectId,
  authenticateUser,
  userAuthorizationHandler("recruiter"),
  filterApplicationsAI
);

module.exports = router;
