import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createError from 'http-errors';
import Notification from '../models/Notification.js';

/**-------------------------------------------
 * @desc   Get User Notifications
 * @route  /api/v1/notifications
 * @method GET
 * @access private (only logged in user)
----------------------------------------------*/
export const getNotificationsCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const notifications = await Notification.find({
      recipient: req.user?._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  },
);

/**-------------------------------------------
 * @desc   Mark Notification As Read
 * @route  /api/v1/notifications/:id
 * @method PATCH
 * @access private (only logged in user)
----------------------------------------------*/
export const markNotificationAsReadCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user?._id },
        { read: true },
        { new: true },
      );

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch {
      throw createError(404, 'Notification not found');
    }
  },
);

/**-------------------------------------------
 * @desc   Delete Notification (Optional)
 * @route  /api/v1/notifications/:id
 * @method DELETE
 * @access private (only logged in user)
----------------------------------------------*/
export const deleteNotificationCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await Notification.deleteOne({
      _id: req.params.id,
      recipient: req.user?._id,
    });

    if (!result || result.deletedCount === 0) {
      throw createError(404, 'Notification not found');
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  },
);
