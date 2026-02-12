const router = require("express").Router();
const { checkRegisterInput, checkLoginInput } = require("../validations/userDataRules.js");
const { inputValidation } = require("../validations/inputValidation.js");
const { authenticateUser } = require("../middlewares/userAuthentication.js");
const { registerUser, loginUser, getMe, logoutUser } = require("../controllers/authController.js");

// /api/v1/auth/register
router.post(
    "/register",
    checkRegisterInput,
    inputValidation,
    registerUser
);

// /api/v1/auth/login
router.post(
    "/login",
    checkLoginInput,
    inputValidation,
    loginUser
);

// /api/v1/auth/me
router.get("/me", authenticateUser, getMe);

// /api/v1/auth/logout
router.post("/logout", authenticateUser, logoutUser);

module.exports = router;