const router = require("express").Router();

const {
    getAllJobs,
    getMyJobs,
    getSingleJob,
    addJob,
    updateSingleJob,
    deleteSingleJob,
    deleteAllJobs
} = require("../controllers/jobsController.js");
const { checkCreateJobInput, checkUpdateJobInput } = require("../validations/jobDataRules.js");
const { inputValidation } = require("../validations/inputValidation.js");

const {userAuthorizationHandler} = require("../middlewares/userAuthorization.js");
const {authenticateUser} = require("../middlewares/userAuthentication.js");
const validateObjectId = require("../middlewares/validateObjectId.js");


// /api/v1/jobs
router.route("/")
    .get(getAllJobs)
    .post(
        authenticateUser,
        userAuthorizationHandler("recruiter"),
        checkCreateJobInput,
        inputValidation,
        addJob
    )
    .delete(authenticateUser, userAuthorizationHandler("admin"), deleteAllJobs);

// /api/v1/jobs/my-jobs
router.get("/my-jobs", authenticateUser, userAuthorizationHandler("recruiter"), getMyJobs);

// /api/v1/jobs/:id
router.route("/:id")
    .get(validateObjectId, getSingleJob)
    .patch(
        validateObjectId,
        authenticateUser,
        userAuthorizationHandler("recruiter"),
        checkUpdateJobInput,
        inputValidation,
        updateSingleJob
    )
    .delete(
        validateObjectId,
        authenticateUser,
        userAuthorizationHandler("recruiter"),
        deleteSingleJob
    );

module.exports = router;