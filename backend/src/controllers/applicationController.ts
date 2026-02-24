import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createError from 'http-errors';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import { sendNotification } from '../services/socketService.js';

/**----------------------------------------------
 * @desc   Get Candidate Applications
 * @route  /api/v1/applications/applicant
 * @method GET
 * @access private (only authenticated user)
-------------------------------------------------*/
export const getCandidateApplicationsCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      sort,
      fields,
      limit: limitParam,
      page: pageParam,
      ...filters
    } = (req.query as any) || {};

    // ensure applicant filter
    filters.applicantId = req.user?._id;

    const page = Math.max(parseInt(String(pageParam), 10) || 1, 1);
    const limit = Math.max(parseInt(String(limitParam), 10) || 5, 1);
    const skip = (page - 1) * limit;

    const sortOptions: { [key: string]: any } = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };
    const sortBy = sortOptions[String(sort)] || sortOptions.newest;

    const fieldSelection = fields
      ? String(fields).split(',').join(' ')
      : '-__v';

    const [applications, totalApplications] = await Promise.all([
      Application.find(filters)
        .sort(sortBy)
        .select(fieldSelection)
        .skip(skip)
        .limit(limit)
        .populate('jobId', 'company position')
        .lean(),
      Application.countDocuments(filters),
    ]);

    const pageCount = Math.ceil(totalApplications / limit);

    res.status(200).json({
      success: true,
      count: applications.length,
      total: totalApplications,
      pagination: {
        current: page,
        limit,
        totalPages: pageCount,
        results: totalApplications,
      },
      data: applications,
    });
  },
);

/**-------------------------------------------------
 * @desc   Get Recruiter Posted Jobs Applications
 * @route  /api/v1/applications/recruiter
 * @method GET
 * @access private (only recruiter)
----------------------------------------------------*/
export const getRecruiterJobsApplicationsCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const filter = { recruiterId: req.user?._id } as any;

    const result = await Application.find(filter).populate('jobId');
    const totalJobsApplications = await Application.countDocuments(filter);

    if (!result || result.length === 0) {
      throw createError(404, 'No Application is found');
    }

    res.status(200).json({
      status: true,
      totalJobsApplications,
      result,
    });
  },
);

/**-------------------------------------------------
 * @desc   Apply to a Job
 * @route  /api/v1/applications/apply
 * @method POST
 * @access private (only users)
----------------------------------------------------*/
export const applyInJobCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const alreadyApplied = await Application.findOne({
      applicantId: req.user?._id,
      jobId: req.body.jobId,
    });

    if (alreadyApplied) {
      throw createError(409, 'Already Applied');
    }

    const job = await Job.findById(req.body.jobId).select('createdBy');
    if (!job) {
      throw createError(404, 'Job not found!');
    }

    // Check user has a resume
    const applicant = await User.findById(req.user?._id).select('resume');
    if (!applicant?.resume?.url || !applicant?.resume?.publicId) {
      throw createError(
        400,
        'Please upload a resume (PDF) to your profile before applying for jobs.',
      );
    }

    const applicationData: any = {
      ...req.body,
      applicantId: req.user?._id,
      recruiterId: job.createdBy,
      resume: {
        url: applicant.resume.url,
        publicId: applicant.resume.publicId,
      },
    };

    const application = new Application(applicationData);
    const result = await application.save();

    const notification = await Notification.create({
      recipient: applicationData.recruiterId,
      type: 'new_application',
      message: `You have received a new application for your job offer.`,
      relatedId: application._id,
    });

    sendNotification(applicationData.recruiterId, notification);

    res.status(201).json({
      status: true,
      message: 'Successfully applied',
      data: result,
    });
  },
);

/**-------------------------------------------------
 * @desc   Update Application Status
 * @route  /api/v1/applications/:id
 * @method PATCH
 * @access private (only recruiter)
----------------------------------------------------*/
export const updateApplicationStatusCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const job = await Job.findById(req.body.jobId).select('createdBy');
    if (!job) {
      throw createError(404, 'Job not found!');
    }

    if (String(job.createdBy) !== String(req.user?._id)) {
      throw createError(401, 'Not authorized to update this job!');
    }

    const application = await Application.findOne({ _id: id });
    if (!application) {
      throw createError(404, 'Application not found!');
    }

    if (application.status === req.body.status) {
      throw createError(400, 'Nothing to update!');
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { status: req.body.status },
      { new: true },
    );

    const notification = await Notification.create({
      recipient: updatedApplication!.applicantId,
      type: 'application_status_update',
      message: `The status of your application has been updated to ${updatedApplication!.status}.`,
      relatedId: updatedApplication!._id,
    });

    sendNotification(String(updatedApplication!.applicantId), notification);

    res.status(200).json({
      status: true,
      message: 'Job Status Updated',
      data: updatedApplication,
    });
  },
);
