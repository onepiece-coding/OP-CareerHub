import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createError from 'http-errors';
import User from '../models/User.js';
import Job from '../models/Job.js';
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import { JOB_STATUS } from '../utils/constants.js';

type MonthlyStat = { date: string; count: number };
type DefaultStat = { name: string; value: number };

/**------------------------------------
 * @desc   Get All Info
 * @route  /api/v1/admin/info
 * @method GET
 * @access private (only admin)
---------------------------------------*/
export const getAllInfoCtrl = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await User.find({});
    const admin = await User.find({ role: 'admin' });
    const recruiter = await User.find({ role: 'recruiter' });
    const applicant = await User.find({ role: 'user' });

    const jobs = await Job.find({});

    const interviewJobs = await Job.find({ jobStatus: JOB_STATUS.INTERVIEW });
    const pendingJobs = await Job.find({ jobStatus: JOB_STATUS.PENDING });
    const declinedJobs = await Job.find({ jobStatus: JOB_STATUS.DECLINED });

    res.status(200).json({
      users: users?.length || 0,
      admins: admin?.length || 0,
      recruiters: recruiter?.length || 0,
      applicants: applicant?.length || 0,
      jobs: jobs?.length || 0,
      interviews: interviewJobs?.length || 0,
      pending: pendingJobs?.length || 0,
      rejected: declinedJobs?.length || 0,
    });
  },
);

/**------------------------------------
 * @desc   Get Monthly Stats
 * @route  /api/v1/admin/stats
 * @method GET
 * @access private (only admin)
---------------------------------------*/
export const getMonthlyStatsCtrl = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = (await Job.aggregate([
      { $group: { _id: '$jobStatus', count: { $sum: 1 } } },
    ])) as Array<{ _id: string; count: number }>;

    const statusMap = stats.reduce<Record<string, number>>((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const defaultStats: DefaultStat[] = [
      { name: 'pending', value: statusMap['pending'] || 0 },
      { name: 'interview', value: statusMap['interview'] || 0 },
      { name: 'rejected', value: statusMap['declined'] || 0 },
    ];

    const monthly_stats = (await Job.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ])) as Array<{
      _id: { year: number; month: number };
      count: number;
    }>;

    const monthly_stats_formatted: MonthlyStat[] = monthly_stats
      .map((item) => {
        const {
          _id: { year, month },
          count,
        } = item;
        const date = dayjs()
          .month(month - 1) // dayjs months are 0-indexed
          .year(year)
          .format('MMM YY');
        return { date, count };
      })
      .reverse(); // reverse to get chronological order (oldest -> newest)

    res
      .status(200)
      .json({ defaultStats, monthly_stats: monthly_stats_formatted });
  },
);

/**------------------------------------
 * @desc   Update User Role
 * @route  /api/v1/admin/update-role
 * @method PATCH
 * @access private (only admin)
---------------------------------------*/
export const updateUserRoleCtrl = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id, role } = req.body as { id?: string; role?: string };
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, 'Invalid user id format');
    }

    await User.findByIdAndUpdate(
      { _id: id },
      { $set: { role } },
      {
        returnDocument: 'after',
      },
    );

    res.status(200).json({
      status: true,
      message: 'Role updated successfully',
    });
  },
);
