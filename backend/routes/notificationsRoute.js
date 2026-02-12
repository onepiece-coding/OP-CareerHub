const router = require("express").Router();
const { getNotifications, markNotificationAsRead, deleteNotification } = require("../controllers/notificationsController.js");
const { authenticateUser } = require("../middlewares/userAuthentication.js");

router.use(authenticateUser); // All routes require authentication

//  /api/v1/notifications
router.get("/", getNotifications);

//  /api/v1/notifications/:id
router.route("/:id")
      .patch(markNotificationAsRead)
      .delete(deleteNotification);

module.exports = router;
