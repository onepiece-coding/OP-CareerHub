import { Schema, model, Document, Types } from 'mongoose';
import { APP_STATUS } from '../utils/constants.js';

export interface IResource {
  url: string;
  publicId: string | null;
}

export interface IApplication extends Document {
  applicantId: Types.ObjectId;
  recruiterId: Types.ObjectId;
  jobId: Types.ObjectId;
  status: string;
  resume: IResource;
  dateOfApplication: Date;
  dateOfJoining: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(APP_STATUS),
      default: APP_STATUS.PENDING,
      required: true,
    },
    resume: {
      type: Object,
      default: {
        url: '',
        publicId: null,
      },
    },
    dateOfApplication: {
      type: Date,
      default: Date.now,
    },
    dateOfJoining: {
      type: Date,
      validate: [
        {
          validator: function (value) {
            return (this as any).dateOfApplication <= value;
          },
          message: 'dateOfJoining should be greater than dateOfApplication',
        },
      ],
    },
  },
  { timestamps: true },
);

export default model<IApplication>('Applicatioon', ApplicationSchema);
