const router = require("express").Router();
const {
  getAllUsers,
  updateUser,
  deleteAllUsers,
  deleteUser,
  getSingleUser,
  profilePhotoUploadCtrl,
} = require("../controllers/usersController.js");
const { checkUserUpdateInput } = require("../validations/userDataRules.js");
const { inputValidation } = require("../validations/inputValidation.js");
const {
  userAuthorizationHandler,
} = require("../middlewares/userAuthorization.js");
const { authenticateUser } = require("../middlewares/userAuthentication.js");
const validateObjectId = require("../middlewares/validateObjectId.js");
const { photoUpload, pdfUpload } = require("../middlewares/fileUpload.js");

// /api/v1/users
router
  .route("/")
  .get(authenticateUser, userAuthorizationHandler("admin"), getAllUsers)
  .delete(authenticateUser, userAuthorizationHandler("admin"), deleteAllUsers);

// /api/v1/users/:id
router
  .route("/:id")
  .get(
    validateObjectId,
    authenticateUser,
    userAuthorizationHandler("admin"),
    getSingleUser
  )
  .patch(
    validateObjectId,
    authenticateUser,
    pdfUpload.single("pdf"),
    checkUserUpdateInput,
    inputValidation,
    updateUser
  )
  .delete(
    validateObjectId,
    authenticateUser,
    userAuthorizationHandler("admin"),
    deleteUser
  );

// /api/v1/users/profile/profile-photo-upload
router
  .route("/profile/profile-photo-upload")
  .post(authenticateUser, photoUpload.single("image"), profilePhotoUploadCtrl);

module.exports = router;
