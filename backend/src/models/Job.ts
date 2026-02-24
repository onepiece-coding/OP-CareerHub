import { Schema, model, Document, Types } from 'mongoose';
import { JOB_STATUS, JOB_TYPE } from '../utils/constants.js';

export interface IJob extends Document {
  company: string;
  position: string;
  jobStatus: string;
  jobType: string;
  jobLocation: string;
  createdBy: Types.ObjectId;
  jobVacancy: string;
  jobSalary: string;
  jobDeadline: string;
  jobDescription: string;
  jobSkills: string[];
  jobFacilities: string[];
  jobContact: string;
}

const JobSchema = new Schema<IJob>(
  {
    company: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 100,
    },
    position: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 100,
    },
    jobStatus: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.PENDING,
    },
    jobType: {
      type: String,
      enum: Object.values(JOB_TYPE),
      default: JOB_TYPE.FULL_TIME,
    },
    jobLocation: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    jobVacancy: {
      type: String,
      required: true,
      trim: true,
    },
    jobSalary: {
      type: String,
      required: true,
      trim: true,
    },
    jobDeadline: {
      type: String,
      required: true,
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 200,
    },
    jobSkills: [{ type: String, trim: true }],
    jobFacilities: [{ type: String, trim: true }],
    jobContact: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

// Populate application for this job

// JobSchema.virtual("applications", {
//   ref: "Application",
//   foreignField: "jobId",
//   localField: "_id",
// });

export default model<IJob>('Job', JobSchema);
