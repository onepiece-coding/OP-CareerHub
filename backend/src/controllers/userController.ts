import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createError from 'http-errors';
import { z } from 'zod';
import xss from 'xss';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import {
  uploadImageBuffer,
  uploadPDFBuffer,
  removeImage,
  removeMultipleImages,
  removePDF,
  removeMultiplePDFs,
} from '../utils/cloudinary.js';

// interface MulterReq extends Request {
//   file?: Express.Multer.File;
// }

// query schema for get all users
const getUsersQuerySchema = z.object({
  pageNumber: z.preprocess((val) => {
    const s = Array.isArray(val) ? val[0] : (val ?? '1');
    const n = Number(s);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  }, z.number().int().min(1).default(1)),
  username: z.preprocess((val) => {
    const s = Array.isArray(val) ? val[0] : val;
    if (typeof s !== 'string' || s.trim() === '') return '';
    return xss(s.trim());
  }, z.string().optional().default('')),
});

/**------------------------------------
 * @desc   Get All Users
 * @route  /api/v1/users
 * @method GET
 * @access private (only admin)
---------------------------------------*/
export const getAllUsersCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = getUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) throw createError(400, 'Invalid query parameters');
    const { username, pageNumber } = parsed.data;

    const USER_PER_PAGE = 10;
    const skip = (pageNumber - 1) * USER_PER_PAGE;

    const query: Record<string, any> = {};

    // Filter
    if (username && username.length > 0) {
      query.username = username;
    }

    // Count total matching
    const totalUsers = await User.countDocuments(query);

    const users = await User.find(query)
      .skip(skip)
      .limit(USER_PER_PAGE)
      .sort({ createdAt: -1 })
      .select('-password -__v');

    res.status(200).json({
      users,
      totalPages: Math.ceil(totalUsers / USER_PER_PAGE),
    });
  },
);

/**-------------------------------------------
 * @desc   Get Single User
 * @route  /api/v1/users/:id
 * @method GET
 * @access private (only admin)
----------------------------------------------*/
export const getSingleUserCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      throw createError(404, 'User not found');
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  },
);

/**-------------------------------------------
 * @desc   Update User
 * @route  /api/v1/users/profile/:id
 * @method PATCH
 * @access private (only user himself)
----------------------------------------------*/
export const updateUserCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    // 1. Permission check
    if (req.user?.id !== req.params.id) {
      throw createError(403, 'Unauthorized!');
    }

    const user = req.user;

    const updates: Partial<Record<string, any>> = {};
    if (req.body.password) updates.password = req.body.password;
    if (req.body.username) updates.username = req.body.username;
    if (req.body.location) updates.location = req.body.location;
    if (req.body.gender) updates.gender = req.body.gender;

    if (Object.keys(updates).length === 0) {
      throw createError(400, 'Nothing to update');
    }

    Object.assign(user, updates);
    await user.save();

    user.password = undefined!;

    res.status(200).json(user);
  },
);

/**---------------------------------------------------
 * @desc   Resume Upload
 * @route  /api/v1/users/profile/resume-upload
 * @method POST
 * @access private (only logged in user)
------------------------------------------------------*/
export const resumeUploadCtrl = asyncHandler(
  async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    let resume: {
      url: string;
      publicId: string;
    };

    if (!req.file) {
      throw createError(400, 'No file provided!');
    } else {
      const uploadRes = await uploadPDFBuffer(req.file.buffer, {
        folder: 'resumes',
      });
      resume = {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
      };
    }

    const user = await User.findById(req.user.id);

    if (!user) throw createError(404, 'User not found');

    if (user.resume.publicId !== null) {
      await removePDF(user!.resume.publicId);
    }

    user.resume = resume;

    await user.save();

    res.status(200).json({
      message: 'your resume uploaded successfully',
      resume,
    });
  },
);

/**---------------------------------------------------
 * @desc   Profile Photo Upload
 * @route  /api/v1/users/profile/profile-photo-upload
 * @method POST
 * @access private (only logged in user)
------------------------------------------------------*/
export const profilePhotoUploadCtrl = asyncHandler(
  async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    let profilePhoto: {
      url: string;
      publicId: string;
    };

    if (!req.file) {
      throw createError(400, 'No image provided!');
    } else {
      const uploadRes = await uploadImageBuffer(req.file.buffer, {
        folder: 'users',
      });
      profilePhoto = {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
      };
    }

    const user = await User.findById(req.user.id);

    if (!user) throw createError(404, 'User not found');

    if (user.profilePhoto.publicId !== null) {
      await removeImage(user!.profilePhoto.publicId);
    }

    user.profilePhoto = profilePhoto;

    await user.save();

    res.status(200).json({
      message: 'your profile photo uploaded successfully',
      profilePhoto,
    });
  },
);

/**------------------------------------------------
 * @desc   Delete User's Profile (Account)
 * @route  /api/v1/users/:id
 * @method DELETE
 * @access private (only admin)
---------------------------------------------------*/
export const deleteUserCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw createError(404, 'User not found!');
    }

    if (user.profilePhoto?.publicId) {
      await removeImage(user.profilePhoto.publicId);
    }

    if (user.resume?.publicId) {
      await removePDF(user.resume.publicId);
    }

    // Delete associated data based on role
    if (user.role === 'user') {
      // Delete all user's applications
      await Application.deleteMany({ applicantId: user._id });
    } else if (user.role === 'recruiter') {
      // Get recruiter's jobs
      const jobs = await Job.find({ createdBy: user._id });
      const jobIds = jobs.map((job: any) => job._id);

      // Delete applications to these jobs
      await Application.deleteMany({ jobId: { $in: jobIds } });

      // Delete the jobs themselves
      await Job.deleteMany({ createdBy: user._id });
    }

    // Delete all notifications where the user is the recipient
    await Notification.deleteMany({ recipient: user._id });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: true,
      message: 'User deleted successfully',
    });
  },
);

/**-------------------------------------------
 * @desc   Delete All Users
 * @route  /api/v1/users
 * @method DELETE
 * @access private (only admin)
----------------------------------------------*/
export const deleteAllUsersCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const role = (req.query.role as string) || undefined;

    // Prevent accidental deletion of admin users
    if (role === 'admin') {
      throw createError(400, 'Admin users can not be deleted');
    }

    const filter = role ? { role } : { role: { $ne: 'admin' } };

    // Get all users and their data
    const users = await User.find(filter);

    // Count total notifications before deletion
    const totalNotificationsCount = await Notification.countDocuments({});

    // Delete Profile Pictures from Cloudinary
    const imagesPublicIds = users
      ?.map((u: any) => u.profilePhoto?.publicId)
      .filter(Boolean);
    if (imagesPublicIds?.length > 0) {
      await removeMultipleImages(imagesPublicIds);
    }

    // Extract all resume public IDs (filtering out falsy values)
    const resumesPublicIds = users
      .map((u: any) => u.resume?.publicId)
      .filter(Boolean);
    // Delete resumes from Cloudinary
    if (resumesPublicIds.length > 0) {
      await removeMultiplePDFs(resumesPublicIds);
    }

    // Separate users by role
    const regularUsers = users
      .filter((u: any) => u.role === 'user')
      .map((u: any) => u._id);
    const recruiters = users
      .filter((u: any) => u.role === 'recruiter')
      .map((u: any) => u._id);

    // Compute application counts for regular users
    const regularApplicationsCount = regularUsers.length
      ? await Application.countDocuments({
          applicantId: { $in: regularUsers },
        })
      : 0;

    // For recruiters, fetch jobs and count related applications
    let recruiterJobs: any[] = [];
    let jobIds: any[] = [];
    if (recruiters.length > 0) {
      recruiterJobs = await Job.find({ createdBy: { $in: recruiters } });
      jobIds = recruiterJobs.map((job) => job._id);
    }
    const recruiterApplicationsCount = jobIds.length
      ? await Application.countDocuments({ jobId: { $in: jobIds } })
      : 0;

    const totalApplicationsCount =
      regularApplicationsCount + recruiterApplicationsCount;

    // Delete applications for regular users
    if (regularUsers.length > 0) {
      await Application.deleteMany({ applicantId: { $in: regularUsers } });
    }

    // Delete recruiters' jobs and related applications
    if (jobIds.length > 0) {
      await Application.deleteMany({ jobId: { $in: jobIds } });
      await Job.deleteMany({ createdBy: { $in: recruiters } });
    }

    // Delete all notifications
    await Notification.deleteMany({});

    // Delete all users matching filter
    const result = await User.deleteMany(filter);

    res.status(200).json({
      status: true,
      message:
        'All non-admin users and their associated data have been successfully deleted.',
      stats: {
        totalUsersDeleted: result.deletedCount,
        resumesDeleted: resumesPublicIds.length,
        applicationsDeleted: totalApplicationsCount,
        jobsDeleted: recruiterJobs.length,
        notificationsDeleted: totalNotificationsCount,
      },
    });
  },
);
