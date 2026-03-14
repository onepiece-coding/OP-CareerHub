import { describe, it, beforeEach, expect, vi } from 'vitest';

// Mock cloudinary first
vi.mock('../../src/utils/cloudinary.js', () => ({
  uploadImageBuffer: vi.fn(),
  uploadPDFBuffer: vi.fn(),
  removeImage: vi.fn(),
  removePDF: vi.fn(),
  removeMultipleImages: vi.fn(),
  removeMultiplePDFs: vi.fn(),
}));

import mongoose from 'mongoose';

beforeEach(async () => {
  // clear DB
  const collections = mongoose.connection.collections;
  for (const k of Object.keys(collections)) {
    // @ts-ignore
    await collections[k].deleteMany({});
  }
  // clear mock state
  const cloud = await import('../../src/utils/cloudinary.js');
  (cloud.removeImage as any).mockClear();
  (cloud.removePDF as any).mockClear();
  (cloud.removeMultipleImages as any).mockClear();
  (cloud.removeMultiplePDFs as any).mockClear();
});

describe('Integration — Delete flows & cleanup', () => {
  it('DELETE /api/v1/users/:id deletes a recruiter and their jobs/applications/notifications and calls Cloudinary removal', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const UserModel = (await import('../../src/models/User.js')).default;
    const JobModel = (await import('../../src/models/Job.js')).default;
    const ApplicationModel = (await import('../../src/models/Application.js'))
      .default;
    const NotificationModel = (await import('../../src/models/Notification.js'))
      .default;
    const cloud = await import('../../src/utils/cloudinary.js');

    // create admin
    const admin = await factories.createUser({
      email: `adm-del-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'admin',
      isAccountVerified: true,
    });

    // create recruiter with profile photo & resume
    const recruiter = await factories.createUser({
      email: `rec-del-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      username: 'toremove',
      isAccountVerified: true,
    });

    // attach media to recruiter
    await UserModel.findByIdAndUpdate(recruiter._id, {
      profilePhoto: {
        url: 'https://cdn.test/old.png',
        publicId: 'old-photo-id',
      },
      resume: { url: 'https://cdn.test/old.pdf', publicId: 'old-resume-id' },
    }).exec();

    // create jobs for that recruiter
    const j1 = await JobModel.create({
      company: 'X1 Ltd',
      position: 'Role 1',
      jobDescription: 'descdesc',
      jobContact: 'a@b',
      createdBy: recruiter._id,
      jobLocation: 'loc',
      jobVacancy: '1',
      jobSalary: '0',
      jobDeadline: '2099-01-01',
    });
    const j2 = await JobModel.create({
      company: 'X2 Ltd',
      position: 'Role 2',
      jobDescription: 'descdesc',
      jobContact: 'a@b',
      createdBy: recruiter._id,
      jobLocation: 'loc',
      jobVacancy: '1',
      jobSalary: '0',
      jobDeadline: '2099-01-01',
    });

    // create applicant and applications to those jobs
    const applicant = await factories.createUser({
      email: `app-del-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'user',
      isAccountVerified: true,
      resume: { url: 'https://cdn.test/app.pdf', publicId: 'app-resume' },
    });

    await ApplicationModel.create({
      applicantId: applicant._id,
      recruiterId: recruiter._id,
      jobId: j1._id,
      status: 'pending',
      resume: {
        url: applicant.resume.url,
        publicId: applicant.resume.publicId,
      },
    });
    await ApplicationModel.create({
      applicantId: applicant._id,
      recruiterId: recruiter._id,
      jobId: j2._id,
      status: 'pending',
      resume: {
        url: applicant.resume.url,
        publicId: applicant.resume.publicId,
      },
    });

    // create some notifications for recruiter using a valid enum value from model
    const notificationEnumValues = (
      NotificationModel.schema.path('type') as any
    )?.enumValues ?? ['system'];
    const validNotificationType = notificationEnumValues.length
      ? notificationEnumValues[0]
      : 'system';

    await NotificationModel.create({
      recipient: recruiter._id,
      read: false,
      message: 'to recruiter',
      type: validNotificationType,
    });

    // login as admin & delete recruiter
    const agent = getAgent();
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'Password1!' })
      .expect(200);
    const cookies = login.headers['set-cookie'];

    await agent
      .delete(`/api/v1/users/${recruiter._id}`)
      .set('Cookie', cookies)
      .expect(200);

    // assertions: recruiter removed
    const foundUser = await UserModel.findById(recruiter._id).exec();
    expect(foundUser).toBeNull();

    // jobs removed
    const jobs = await JobModel.find({ createdBy: recruiter._id })
      .lean()
      .exec();
    expect(jobs.length).toBe(0);

    // applications to those jobs removed
    const apps = await ApplicationModel.find({ recruiterId: recruiter._id })
      .lean()
      .exec();
    expect(apps.length).toBe(0);

    // notifications for recruiter removed
    const notifs = await NotificationModel.find({ recipient: recruiter._id })
      .lean()
      .exec();
    expect(notifs.length).toBe(0);

    // Cloudinary remove functions called for personal media
    expect(cloud.removeImage).toHaveBeenCalledWith('old-photo-id');
    expect(cloud.removePDF).toHaveBeenCalledWith('old-resume-id');
  }, 20000);

  it("DELETE /api/v1/users/:id deletes regular user => removes user's applications and media (if present)", async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const UserModel = (await import('../../src/models/User.js')).default;
    const JobModel = (await import('../../src/models/Job.js')).default;
    const ApplicationModel = (await import('../../src/models/Application.js'))
      .default;
    const cloud = await import('../../src/utils/cloudinary.js');

    // seed: admin, recruiter, job, applicant (with resume/profile), application
    const admin = await factories.createUser({
      email: `adm-usr-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'admin',
      isAccountVerified: true,
    });

    const rec = await factories.createUser({
      email: `rec-usr-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
    });

    const job = await JobModel.create({
      company: 'SomeCo',
      position: 'SomePos',
      jobDescription: 'descdesc',
      jobContact: 'a@b',
      createdBy: rec._id,
      jobLocation: 'loc',
      jobVacancy: '1',
      jobSalary: '0',
      jobDeadline: '2099-01-01',
    });

    const applicant = await factories.createUser({
      email: `app-usr-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'user',
      username: 'appToDel',
      isAccountVerified: true,
    });

    // give applicant media & application
    await UserModel.findByIdAndUpdate(applicant._id, {
      profilePhoto: { url: 'https://cdn.test/a.png', publicId: 'a-photo' },
      resume: { url: 'https://cdn.test/a.pdf', publicId: 'a-resume' },
    }).exec();

    await ApplicationModel.create({
      applicantId: applicant._id,
      recruiterId: rec._id,
      jobId: job._id,
      status: 'pending',
      resume: { url: 'https://cdn.test/a.pdf', publicId: 'a-resume' },
    });

    // login admin & delete applicant
    const agent = getAgent();
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'Password1!' })
      .expect(200);
    const cookies = login.headers['set-cookie'];

    await agent
      .delete(`/api/v1/users/${applicant._id}`)
      .set('Cookie', cookies)
      .expect(200);

    // assert applicant removed
    const found = await UserModel.findById(applicant._id).exec();
    expect(found).toBeNull();

    // applications by this applicant removed
    const apps = await ApplicationModel.find({ applicantId: applicant._id })
      .lean()
      .exec();
    expect(apps.length).toBe(0);

    // Cloudinary removals called for applicant's personal media
    expect(cloud.removeImage).toHaveBeenCalledWith('a-photo');
    expect(cloud.removePDF).toHaveBeenCalledWith('a-resume');
  });

  it('DELETE /api/v1/users (deleteAllUsersCtrl) deletes non-admin users, calls removeMultiple* and returns stats; role=admin query is blocked', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const UserModel = (await import('../../src/models/User.js')).default;
    const JobModel = (await import('../../src/models/Job.js')).default;
    const ApplicationModel = (await import('../../src/models/Application.js'))
      .default;
    const cloud = await import('../../src/utils/cloudinary.js');

    // create admin
    const admin = await factories.createUser({
      email: `adm-all-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'admin',
      isAccountVerified: true,
    });

    // create recruiters (with resume/profile) and jobs & applications
    const recA = await factories.createUser({
      email: `recA-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
    });
    const recB = await factories.createUser({
      email: `recB-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
    });

    await UserModel.findByIdAndUpdate(recA._id, {
      profilePhoto: { url: 'https://cdn.test/rA.png', publicId: 'rA-photo' },
      resume: { url: 'https://cdn.test/rA.pdf', publicId: 'rA-resume' },
    }).exec();
    await UserModel.findByIdAndUpdate(recB._id, {
      profilePhoto: { url: 'https://cdn.test/rB.png', publicId: 'rB-photo' },
      resume: { url: 'https://cdn.test/rB.pdf', publicId: 'rB-resume' },
    }).exec();

    const jobs = await JobModel.insertMany([
      {
        company: 'DelCorpA',
        position: 'Position A',
        jobDescription: 'descdesc',
        jobContact: 'a@a',
        createdBy: recA._id,
        jobLocation: 'L',
        jobVacancy: '1',
        jobSalary: '0',
        jobDeadline: '2099-01-01',
      },
      {
        company: 'DelCorpB',
        position: 'Position B',
        jobDescription: 'descdesc',
        jobContact: 'b@b',
        createdBy: recB._id,
        jobLocation: 'L',
        jobVacancy: '1',
        jobSalary: '0',
        jobDeadline: '2099-01-01',
      },
    ]);

    // create applicants and applications
    const applicant1 = await factories.createUser({
      email: `ap1-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'user',
      isAccountVerified: true,
      resume: { url: 'https://cdn.test/ap1.pdf', publicId: 'ap1-resume' },
    });
    await ApplicationModel.create({
      applicantId: applicant1._id,
      recruiterId: recA._id,
      jobId: jobs[0]._id,
      status: 'pending',
      resume: {
        url: applicant1.resume.url,
        publicId: applicant1.resume.publicId,
      },
    });

    // login admin
    const agent = getAgent();
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'Password1!' })
      .expect(200);
    const cookies = login.headers['set-cookie'];

    // call deleteAll (no role param => should delete non-admin users)
    const delRes = await agent
      .delete('/api/v1/users')
      .set('Cookie', cookies)
      .expect(200);
    expect(delRes.body).toHaveProperty('stats');

    // removeMultipleImages and removeMultiplePDFs should have been called with arrays that include our publicIds
    expect(cloud.removeMultipleImages).toHaveBeenCalled();
    expect(cloud.removeMultiplePDFs).toHaveBeenCalled();

    // Confirm jobs, applications and users (non-admin) were deleted
    const remainingJobs = await JobModel.countDocuments({}).exec();
    expect(remainingJobs).toBe(0);

    const remainingApplications = await ApplicationModel.countDocuments(
      {},
    ).exec();
    expect(remainingApplications).toBe(0);

    // Now calling DELETE with role=admin should return 400
    await agent
      .delete('/api/v1/users?role=admin')
      .set('Cookie', cookies)
      .expect(400);
  });
});
