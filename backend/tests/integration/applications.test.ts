import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock external side-effects first
vi.mock('../../src/utils/sendEmail.js', () => ({ default: vi.fn() }));
vi.mock('../../src/services/socketService.js', () => ({
  sendNotification: vi.fn(),
}));

beforeEach(async () => {
  vi.resetAllMocks();
  const mongoose = await import('mongoose');
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    // @ts-ignore
    await collections[key].deleteMany({});
  }
});

describe('Integration — Applications (apply & recruiter actions)', () => {
  it('Applicant can apply to a job -> Application created with applicantId & recruiterId', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const JobModel = (await import('../../src/models/Job.js')).default;
    const ApplicationModel = (await import('../../src/models/Application.js'))
      .default;
    const UserModel = (await import('../../src/models/User.js')).default;

    // create recruiter and login
    const recruiterData = {
      email: `rec-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
      username: 'rec-create-job',
    };
    await factories.createUser(recruiterData);

    const agentRec = getAgent();
    const loginRec = await agentRec
      .post('/api/v1/auth/login')
      .send({ email: recruiterData.email, password: recruiterData.password })
      .expect(200);
    const recCookies = loginRec.headers['set-cookie'];
    expect(recCookies && recCookies.length).toBeGreaterThan(0);

    // create job as recruiter
    const jobPayload = {
      company: 'IntegrationCorp',
      position: 'QA Engineer',
      jobDescription: 'Great job for testing',
      jobLocation: 'Remote',
      jobVacancy: '1',
      jobSalary: '0',
      jobDeadline: '2099-01-01',
      jobSkills: ['testing'],
      jobFacilities: [],
      jobContact: 'hr@integration.test',
    };

    const createJobRes = await agentRec
      .post('/api/v1/jobs')
      .set('Cookie', recCookies)
      .send(jobPayload)
      .expect(201);

    const createdJob = createJobRes.body.result ?? createJobRes.body;
    const jobId = createdJob._id ?? createdJob.id;
    expect(jobId).toBeTruthy();

    // create applicant user and ensure they have a resume
    const applicantData = {
      email: `app-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'user',
      isAccountVerified: true,
      username: 'applicant1',
    };
    const applicant = await factories.createUser(applicantData);
    await UserModel.findByIdAndUpdate(applicant._id, {
      resume: { url: 'https://example/resume.pdf', publicId: 'r1' },
    }).exec();

    const agentApp = getAgent();
    const loginApp = await agentApp
      .post('/api/v1/auth/login')
      .send({ email: applicantData.email, password: applicantData.password })
      .expect(200);
    const appCookies = loginApp.headers['set-cookie'];
    expect(appCookies && appCookies.length).toBeGreaterThan(0);

    // APPLY
    const applyPayload = {
      jobId,
      resume: { url: 'https://example/resume.pdf', publicId: 'r1' },
      coverLetter: 'Please hire me',
    };

    const applyRes = await agentApp
      .post('/api/v1/applications/apply')
      .set('Cookie', appCookies)
      .send(applyPayload)
      .expect(201);

    const appBody = applyRes.body.data ?? applyRes.body.result ?? applyRes.body;
    const appId = appBody._id ?? appBody.id;
    expect(appId).toBeTruthy();

    const found = await ApplicationModel.findById(appId).lean().exec();
    expect(found).toBeTruthy();
    expect(String((found as any).applicantId)).toBe(String(applicant._id));

    const jobFromDb = await JobModel.findById(jobId).lean().exec();
    expect(jobFromDb).toBeTruthy();
    const expectedRecruiterId = String((jobFromDb as any).createdBy ?? '');
    expect(String((found as any).recruiterId)).toBe(expectedRecruiterId);
  }, 20000);

  it('Recruiter can accept and reject an application (status transitions)', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const ApplicationModel = (await import('../../src/models/Application.js'))
      .default;
    const UserModel = (await import('../../src/models/User.js')).default;

    const recData = {
      email: `rec2-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
      username: 'rec2',
    };
    await factories.createUser(recData);

    const agentRec = getAgent();
    const loginRec = await agentRec
      .post('/api/v1/auth/login')
      .send({ email: recData.email, password: recData.password })
      .expect(200);
    const recCookies = loginRec.headers['set-cookie'];

    // create a job
    const jobRes = await agentRec
      .post('/api/v1/jobs')
      .set('Cookie', recCookies)
      .send({
        company: 'HireCorp',
        position: 'Interviewer',
        jobDescription: 'descdesc',
        jobLocation: 'remote',
        jobVacancy: '1',
        jobSalary: '0',
        jobDeadline: '2099-01-01',
        jobSkills: ['x'],
        jobFacilities: [],
        jobContact: 'a@b',
      })
      .expect(201);
    const createdJob = jobRes.body.result ?? jobRes.body;
    const jobId = createdJob._id ?? createdJob.id;

    // applicant apply (ensure resume present)
    const applicant = await factories.createUser({
      email: `app2-${Date.now()}@example.test`,
      password: 'Password1!',
      isAccountVerified: true,
      role: 'user',
      username: 'ap2',
    });
    await UserModel.findByIdAndUpdate(applicant._id, {
      resume: { url: 'https://example/resume.pdf', publicId: 'r1' },
    }).exec();

    const agentApp = getAgent();
    const loginApp = await agentApp
      .post('/api/v1/auth/login')
      .send({ email: applicant.email, password: 'Password1!' })
      .expect(200);
    const appCookies = loginApp.headers['set-cookie'];

    const applyRes = await agentApp
      .post('/api/v1/applications/apply')
      .set('Cookie', appCookies)
      .send({ jobId })
      .expect(201);
    const createdApp =
      applyRes.body.data ?? applyRes.body.result ?? applyRes.body;
    const appId = createdApp._id ?? createdApp.id;

    // recruiter accepts the application (PATCH /api/v1/applications/:id with jobId & status)
    const acceptRes = await agentRec
      .patch(`/api/v1/applications/${appId}`)
      .set('Cookie', recCookies)
      .send({ jobId, status: 'accepted' })
      .expect(200);
    expect(acceptRes.body).toHaveProperty('status', true);

    const updated = await ApplicationModel.findById(appId).lean().exec();
    expect((updated as any).status).toBe('accepted');

    // set to rejected
    await agentRec
      .patch(`/api/v1/applications/${appId}`)
      .set('Cookie', recCookies)
      .send({ jobId, status: 'rejected' })
      .expect(200);
    const updated2 = await ApplicationModel.findById(appId).lean().exec();
    expect((updated2 as any).status).toBe('rejected');
  }, 20000);

  it('Invalid jobId in application body -> 400 (validation)', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const UserModel = (await import('../../src/models/User.js')).default;

    const applicant = await factories.createUser({
      email: `badid-${Date.now()}@example.test`,
      password: 'Password1!',
      isAccountVerified: true,
      role: 'user',
      username: 'badid',
    });
    await UserModel.findByIdAndUpdate(applicant._id, {
      resume: { url: 'https://example/resume.pdf', publicId: 'r1' },
    }).exec();

    const agentApp = getAgent();
    const loginApp = await agentApp
      .post('/api/v1/auth/login')
      .send({ email: applicant.email, password: 'Password1!' })
      .expect(200);
    const appCookies = loginApp.headers['set-cookie'];

    await agentApp
      .post('/api/v1/applications/apply')
      .set('Cookie', appCookies)
      .send({ jobId: '123' })
      .expect(400);
  });

  it('Applying twice should be prevented (duplicate) -> second attempt returns 409', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const UserModel = (await import('../../src/models/User.js')).default;

    const rec = await factories.createUser({
      email: `rec-dup-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
      username: 'recdup',
    });
    const agentRec = getAgent();
    const loginRec = await agentRec
      .post('/api/v1/auth/login')
      .send({ email: rec.email, password: 'Password1!' })
      .expect(200);
    const recCookies = loginRec.headers['set-cookie'];

    const jobRes = await agentRec
      .post('/api/v1/jobs')
      .set('Cookie', recCookies)
      .send({
        company: 'DupCorp',
        position: 'Duplicator',
        jobDescription: 'longerdesc',
        jobLocation: 'remote',
        jobVacancy: '1',
        jobSalary: '0',
        jobDeadline: '2099-01-01',
        jobSkills: ['s'],
        jobFacilities: [],
        jobContact: 'x@y',
      })
      .expect(201);
    const createdJob = jobRes.body.result ?? jobRes.body;
    const jobId = createdJob._id ?? createdJob.id;

    const applicant = await factories.createUser({
      email: `app-dup-${Date.now()}@example.test`,
      password: 'Password1!',
      isAccountVerified: true,
      role: 'user',
      username: 'appdup',
    });
    await UserModel.findByIdAndUpdate(applicant._id, {
      resume: { url: 'https://example/resume.pdf', publicId: 'r1' },
    }).exec();

    const agentApp = getAgent();
    const loginApp = await agentApp
      .post('/api/v1/auth/login')
      .send({ email: applicant.email, password: 'Password1!' })
      .expect(200);
    const appCookies = loginApp.headers['set-cookie'];

    // first apply: ok
    await agentApp
      .post('/api/v1/applications/apply')
      .set('Cookie', appCookies)
      .send({ jobId })
      .expect(201);

    // second apply: expect conflict (409)
    await agentApp
      .post('/api/v1/applications/apply')
      .set('Cookie', appCookies)
      .send({ jobId })
      .expect(409);
  });
});
