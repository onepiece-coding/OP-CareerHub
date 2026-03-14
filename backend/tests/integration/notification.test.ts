import { describe, it, beforeEach, expect, vi } from 'vitest';

// mock socket service 1st
vi.mock('../../src/services/socketService.js', () => ({
  sendNotification: vi.fn(),
}));

// dynamic imports after mocks
beforeEach(async () => {
  const mongoose = await import('mongoose');
  const collections = mongoose.connection.collections;
  for (const k of Object.keys(collections)) {
    // @ts-ignore
    await collections[k].deleteMany({});
  }
  // reset mock state
  const { sendNotification } =
    await import('../../src/services/socketService.js');
  (sendNotification as any).mockClear();
  vi.resetAllMocks();
});

describe('Integration — Notifications (controller-level)', () => {
  it('on login: unread notifications exist -> sendNotification called for each unread', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const NotificationModel = (await import('../../src/models/Notification.js'))
      .default;
    const { sendNotification } =
      await import('../../src/services/socketService.js');

    // create user + some unread notifications
    const user = await factories.createUser({
      email: `notify-login-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'notifyLogin',
      isAccountVerified: true,
    });

    const nCount = 4;
    for (let i = 0; i < nCount; i++) {
      await NotificationModel.create({
        recipient: user._id,
        read: false,
        message: `unread ${i}`,
        type: 'new_application',
      });
    }

    // login
    const agent = getAgent();
    await agent
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'Password1!' })
      .expect(200);

    // sendNotification should be called for each unread
    expect((sendNotification as any).mock.calls.length).toBe(nCount);
  }, 20000);

  it('applying to a job triggers sendNotification to recruiter', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const JobModel = (await import('../../src/models/Job.js')).default;
    const ApplicationModel = (await import('../../src/models/Application.js'))
      .default;
    const { sendNotification } =
      await import('../../src/services/socketService.js');

    // create recruiter & job
    const recruiter = await factories.createUser({
      email: `rec-notify-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'recNotify',
      role: 'recruiter',
      isAccountVerified: true,
    });

    const job = await JobModel.create({
      company: 'NotifyCo',
      position: 'Notifier',
      jobDescription: 'descdesc',
      jobLocation: 'remote',
      jobVacancy: '1',
      jobSalary: '0',
      jobDeadline: '2099-01-01',
      jobSkills: ['n'],
      jobFacilities: [],
      jobContact: 'a@b',
      createdBy: recruiter._id,
    });

    // create applicant with resume (controller checks for resume)
    const applicant = await factories.createUser({
      email: `app-notify-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'appNotify',
      role: 'user',
      isAccountVerified: true,
      // give resume so apply controller proceeds
      resume: { url: 'https://x.pdf', publicId: 'p1' },
    });

    // login applicant
    const agentApp = getAgent();
    const loginApp = await agentApp
      .post('/api/v1/auth/login')
      .send({ email: applicant.email, password: 'Password1!' })
      .expect(200);
    const cookies = loginApp.headers['set-cookie'];

    // apply
    const applyRes = await agentApp
      .post('/api/v1/applications/apply')
      .set('Cookie', cookies)
      .send({ jobId: job._id.toString() })
      .expect(201);

    // sendNotification should be called at least once (to recruiter)
    expect((sendNotification as any).mock.calls.length).toBeGreaterThanOrEqual(
      1,
    );

    // verify Application stored
    const body = applyRes.body.data ?? applyRes.body.result ?? applyRes.body;
    const appId = body._id ?? body.id;
    const found = await ApplicationModel.findById(appId).lean().exec();
    expect(found).toBeTruthy();
    expect(String((found as any).recruiterId)).toBe(String(recruiter._id));
  });

  it('updating job status creates notifications for applicants and calls sendNotification per applicant', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const JobModel = (await import('../../src/models/Job.js')).default;
    const ApplicationModel = (await import('../../src/models/Application.js'))
      .default;
    const { sendNotification } =
      await import('../../src/services/socketService.js');

    // create recruiter + job
    const recruiter = await factories.createUser({
      email: `rec-up-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'recUp',
      role: 'recruiter',
      isAccountVerified: true,
    });

    const job = await JobModel.create({
      company: 'UpdCorp',
      position: 'Updater',
      jobDescription: 'descdesc',
      jobLocation: 'remote',
      jobVacancy: '1',
      jobSalary: '0',
      jobDeadline: '2099-01-01',
      jobSkills: ['u'],
      jobFacilities: [],
      jobContact: 'a@b',
      createdBy: recruiter._id,
    });

    // two applicants apply (create Application docs directly to simulate prior applicants)
    const appA = await factories.createUser({
      email: `ap-up-a-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'apa',
      role: 'user',
      isAccountVerified: true,
      resume: { url: 'https://x.pdf', publicId: 'r1' },
    });
    const appB = await factories.createUser({
      email: `ap-up-b-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'apb',
      role: 'user',
      isAccountVerified: true,
      resume: { url: 'https://x.pdf', publicId: 'r2' },
    });

    // create Application docs
    await ApplicationModel.create({
      applicantId: appA._id,
      recruiterId: recruiter._id,
      jobId: job._id,
      status: 'pending',
      resume: { url: appA.resume.url, publicId: appA.resume.publicId },
    });
    await ApplicationModel.create({
      applicantId: appB._id,
      recruiterId: recruiter._id,
      jobId: job._id,
      status: 'pending',
      resume: { url: appB.resume.url, publicId: appB.resume.publicId },
    });

    // login recruiter
    const agentRec = getAgent();
    const loginRec = await agentRec
      .post('/api/v1/auth/login')
      .send({ email: recruiter.email, password: 'Password1!' })
      .expect(200);
    const recCookies = loginRec.headers['set-cookie'];

    // update job status (this controller will create notifications via Notification.insertMany and call sendNotification for each)
    await agentRec
      .patch(`/api/v1/jobs/${job._id.toString()}`)
      .set('Cookie', recCookies)
      .send({ jobStatus: 'interview' })
      .expect(200);

    // two notifications expected, sendNotification should have been called twice
    expect((sendNotification as any).mock.calls.length).toBeGreaterThanOrEqual(
      2,
    );
  });
});
