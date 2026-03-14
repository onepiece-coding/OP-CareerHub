import UserModel from '../../src/models/User.js';
import JobModel from '../../src/models/Job.js';
import NotificationModel from '../../src/models/Notification.js';
import ApplicationModel from '../../src/models/Application.js';
import { Types } from 'mongoose';

export async function createUser(overrides: Partial<any> = {}) {
  const unique = Date.now().toString(36);
  const defaults = {
    username: `user_${unique}`,
    email: `user_${unique}@example.com`,
    password: 'Password1!',
    role: 'user',
    isAccountVerified: true,
    location: 'Country, City, Street',
  };
  const doc = new UserModel({ ...defaults, ...overrides });
  await doc.save();
  return doc;
}

export async function createJob(overrides: Partial<any> = {}) {
  const defaults = {
    company: 'Acme Corp',
    position: 'Developer',
    jobDescription: 'A job description',
    jobLocation: 'Remote',
    jobVacancy: '1',
    jobSalary: '5000',
    jobDeadline: '2028-01-01',
    jobSkills: ['js', 'node'],
    jobFacilities: ['wifi'],
    jobContact: 'hr@acme.test',
    createdBy: overrides.createdBy ?? new Types.ObjectId(),
  };
  const doc = new JobModel({ ...defaults, ...overrides });
  await doc.save();
  return doc;
}

export async function createNotification(overrides: Partial<any> = {}) {
  const defaults = {
    recipient: overrides.recipient ?? new Types.ObjectId(),
    title: 'Test notification',
    body: 'Hello',
    read: false,
  };
  const doc = new NotificationModel({ ...defaults, ...overrides });
  await doc.save();
  return doc;
}

export async function createApplication(overrides: Partial<any> = {}) {
  const defaults = {
    applicantId: overrides.applicantId ?? new Types.ObjectId(),
    recruiterId: overrides.recruiterId ?? new Types.ObjectId(),
    jobId: overrides.jobId ?? new Types.ObjectId(),
    status: overrides.status ?? 'pending',
    resume: overrides.resume ?? { url: '', publicId: null },
  };
  const doc = new ApplicationModel({ ...defaults, ...overrides });
  await doc.save();
  return doc;
}
