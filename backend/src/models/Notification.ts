import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: 'application_status_update' | 'job_status_update' | 'new_application';
  message: string;
  relatedId: Types.ObjectId;
  read: boolean;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'application_status_update',
        'job_status_update',
        'new_application',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId, // e.g., Application or Job ID
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default model<INotification>('Notification', NotificationSchema);
