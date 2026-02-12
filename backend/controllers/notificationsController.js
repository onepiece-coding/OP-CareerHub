const Notification = require("../models/Notification.js");
const createError = require("http-errors");

/**-------------------------------------------
 * @desc   Get User Notifications
 * @route  /api/v1/notifications
 * @method GET
 * @access private (only logged in user)
----------------------------------------------*/
module.exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(createError(500, `Quelque chose s'est mal passé: ${error.message}`));
  }
};

/**-------------------------------------------
 * @desc   Mark Notification As Read
 * @route  /api/v1/notifications/:id
 * @method PATCH
 * @access private (only logged in user)
----------------------------------------------*/
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification)
      return next(createError(404, "Notification non trouvée"));
    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(createError(500, `Quelque chose s'est mal passé: ${error.message}`));
  }
};

/**-------------------------------------------
 * @desc   Delete Notificatio (Optional)
 * @route  /api/v1/notifications/:id
 * @method Delete
 * @access private (only logged in user)
----------------------------------------------*/
exports.deleteNotification = async (req, res, next) => {
  try {
    const result = await Notification.deleteOne({
      _id: req.params.id,
      recipient: req.user._id,
    });
    if (result.deletedCount === 0)
      return next(createError(404, "Notification non trouvée"));
    res.status(200).json({
      success: true,
      message: "Notification supprimée",
    });
  } catch (error) {
    next(createError(500, `Quelque chose s'est mal passé: ${error.message}`));
  }
};
