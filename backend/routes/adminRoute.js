const router = require("express").Router();
const {userAuthorizationHandler} = require("../middlewares/userAuthorization.js");
const {authenticateUser} = require("../middlewares/userAuthentication.js");
const { getAllInfo, getMonthlyStats, updateUserRole } = require("../controllers/adminController.js");

// /api/v1/admin/info
router.get("/info", authenticateUser, userAuthorizationHandler("admin"), getAllInfo);

// /api/v1/admin/stats
router.get("/stats", authenticateUser, userAuthorizationHandler("admin"), getMonthlyStats);

// /api/v1/admin/update-role
router.patch("/update-role", authenticateUser, userAuthorizationHandler("admin"), updateUserRole);

module.exports = router;