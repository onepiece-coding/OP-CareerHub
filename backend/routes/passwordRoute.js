const router = require("express").Router();
const {
  checkEmail,
  checkNewPassword,
} = require("../validations/userDataRules.js");
const { inputValidation } = require("../validations/inputValidation.js");
const {
  sendResetPasswordLink,
  resetPassword,
  getResetPasswordLink,
} = require("../controllers/passwordController.js");

// /api/v1/password/forgot-password
router.post(
  "/forgot-password",
  checkEmail,
  inputValidation,
  sendResetPasswordLink
);

// /api/v1/password/reset-password/:token
router
  .route("/reset-password/:token")
  .get(getResetPasswordLink)
  .post(checkNewPassword, inputValidation, resetPassword);

module.exports = router;
