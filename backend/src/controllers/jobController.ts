import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createError from 'http-errors';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import { sendNotification } from '../services/socketService.js';

/**------------------------------------
 * @desc   Get All Jobs
 * @route  /api/v1/jobs
 * @method GET
 * @access public
---------------------------------------*/
export const getAllJobsCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      sort,
      fields,
      page: pageParam,
      limit: limitParam,
      search,
      ...queryParams
    } = req.query as { [key: string]: any };

    const filters: any = { ...queryParams };

    if (search) {
      filters.$or = [
        'company',
        'position',
        'jobStatus',
        'jobType',
        'jobLocation',
      ].map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      }));
    }

    const page = Math.max(parseInt(String(pageParam), 10) || 1, 1);
    const limit = Math.max(parseInt(String(limitParam), 10) || 5, 1);
    const skip = (page - 1) * limit;

    const sortOptions: { [key: string]: any } = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'a-z': { position: 1 },
      'z-a': { position: -1 },
    };
    const sortBy = sortOptions[String(sort)] || sortOptions.newest;

    const fieldSelection = fields
      ? String(fields).split(',').join(' ')
      : '-__v';

    const [jobs, totalJobs] = await Promise.all([
      Job.find(filters)
        .sort(sortBy)
        .select(fieldSelection)
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filters),
    ]);

    const pageCount = Math.ceil(totalJobs / limit);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total: totalJobs,
      pagination: {
        current: page,
        limit,
        totalPages: pageCount,
        results: totalJobs,
      },
      data: jobs,
    });
  },
);

/**------------------------------------
 * @desc   Get My Jobs
 * @route  /api/v1/jobs/my-jobs
 * @method GET
 * @access private(only recruiter)
---------------------------------------*/
export const getMyJobsCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const jobs = await Job.find({ createdBy: userId }).populate(
      'createdBy',
      'username email',
    );

    if (!jobs || jobs.length === 0) {
      throw createError(404, 'No jobs found for this recruiter!');
    }

    res.status(200).json({
      status: true,
      data: jobs,
    });
  },
);

/**------------------------------------
 * @desc   Get Single Job
 * @route  /api/v1/jobs/:id
 * @method GET
 * @access public
---------------------------------------*/
export const getSingleJobCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await Job.findById(req.params.id);
    if (!result) {
      throw createError(404, 'Job not found!');
    }

    res.status(200).json({
      status: true,
      result,
    });
  },
);

/**------------------------------------
 * @desc   Add Job
 * @route  /api/v1/jobs
 * @method POST
 * @access private(only recruiter)
---------------------------------------*/
export const addJobCtrl = asyncHandler(async (req: Request, res: Response) => {
  const jobData = req.body;
  const { company, position, jobVacancy } = jobData;
  const jobExists = await Job.findOne({
    company,
    position,
    jobVacancy,
  });
  if (jobExists) {
    throw createError(409, 'Job already exists');
  }

  jobData.createdBy = req.user?._id;
  const newJob = new Job(jobData);
  const result = await newJob.save();

  res.status(201).json({
    status: true,
    result,
  });
});

/**------------------------------------
 * @desc   Update Single Job
 * @route  /api/v1/jobs/:id
 * @method PATCH
 * @access private(only recruiter)
---------------------------------------*/
export const updateSingleJobCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const job = await Job.findOne({ _id: id });
    if (!job) {
      throw createError(404, 'Job not found!');
    }

    if (
      Object.prototype.hasOwnProperty.call(req.body, 'jobStatus') &&
      job.jobStatus === req.body.jobStatus
    ) {
      throw createError(400, 'Nothing to update!');
    }

    const updatedJob = await Job.findByIdAndUpdate(id, data, {
      new: true,
    });

    const applications = await Application.find({
      jobId: updatedJob!._id,
    });

    const notifications = applications.map((app: any) => ({
      recipient: app.applicantId,
      type: 'job_status_update',
      message: `The status of the job you applied for has been updated to ${updatedJob!.jobStatus}.`,
      relatedId: updatedJob!._id,
    }));

    await Notification.insertMany(notifications);

    notifications.forEach((notification: any) => {
      sendNotification(notification.recipient, notification);
    });

    res.status(200).json({
      status: true,
      message: 'Job Updated',
      result: updatedJob,
    });
  },
);

/**------------------------------------
 * @desc   Delete Single Job
 * @route  /api/v1/jobs/:id
 * @method DELETE
 * @access private(only recruiter)
---------------------------------------*/
export const deleteSingleJobCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const isJobExists = await Job.findOne({ _id: id });
    if (!isJobExists) {
      throw createError(404, 'Job not Found!');
    } else {
      await Application.deleteMany({ jobId: id });
      const result = await Job.findByIdAndDelete(id);

      res.status(200).json({
        status: true,
        message: 'Job deleted',
        result,
      });
    }
  },
);

/**------------------------------------
 * @desc   Delete All Jobs
 * @route  /api/v1/jobs
 * @method DELETE
 * @access private (only admin)
---------------------------------------*/
export const deleteAllJobsCtrl = asyncHandler(
  async (_req: Request, res: Response) => {
    const jobs = await Job.find({}, '_id');
    const jobIds = jobs.map((job: any) => job._id);

    if (jobIds.length > 0) {
      await Application.deleteMany({ jobId: { $in: jobIds } });
    }

    const result = await Job.deleteMany({});

    res.status(200).json({
      status: true,
      message:
        'All jobs and their associated applications have been successfully deleted.',
      result,
    });
  },
);
