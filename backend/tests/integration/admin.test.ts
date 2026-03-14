import { describe, it, expect, beforeEach, vi } from 'vitest';
import dayjs from 'dayjs';

beforeEach(async () => {
  vi.resetAllMocks();
  const mongoose = await import('mongoose');
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    // @ts-ignore
    await collections[key].deleteMany({});
  }
});

describe('Integration — Admin endpoints & stats', () => {
  it('GET /api/v1/admin/info returns correct counts (users/jobs/statuses) for admin', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const JobModel = (await import('../../src/models/Job.js')).default;

    // create admin + recruiters + applicants
    const admin = await factories.createUser({
      email: `admin-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'admin',
      username: 'theadmin',
      isAccountVerified: true,
    });

    const rec1 = await factories.createUser({
      email: `rec1-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      username: 'rec1',
      isAccountVerified: true,
    });

    const rec2 = await factories.createUser({
      email: `rec2-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      username: 'rec2',
      isAccountVerified: true,
    });

    // 3 applicants
    await factories.createUser({
      email: `app1-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'user',
      username: 'app1',
      isAccountVerified: true,
    });
    await factories.createUser({
      email: `app2-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'user',
      username: 'app2',
      isAccountVerified: true,
    });
    await factories.createUser({
      email: `app3-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'user',
      username: 'app3',
      isAccountVerified: true,
    });

    // create jobs with statuses (createdBy must be recruiter)
    await JobModel.create({
      company: 'Company One Ltd',
      position: 'Senior QA Engineer',
      jobDescription: 'descdesc',
      jobLocation: 'loc',
      jobVacancy: '1',
      jobSalary: '0',
      jobDeadline: '2099-01-01',
      jobSkills: ['x'],
      jobFacilities: [],
      jobContact: 'a@b',
      createdBy: rec1._id,
      jobStatus: 'pending',
    });
    await JobModel.create({
      company: 'Company Two Ltd',
      position: 'Junior QA Engineer',
      jobDescription: 'descdesc',
      jobLocation: 'loc',
      jobVacancy: '1',
      jobSalary: '0',
      jobDeadline: '2099-01-01',
      jobSkills: ['x'],
      jobFacilities: [],
      jobContact: 'a@b',
      createdBy: rec2._id,
      jobStatus: 'interview',
    });
    await JobModel.create({
      company: 'Company Three Ltd',
      position: 'Senior Developer',
      jobDescription: 'descdesc',
      jobLocation: 'loc',
      jobVacancy: '1',
      jobSalary: '0',
      jobDeadline: '2099-01-01',
      jobSkills: ['x'],
      jobFacilities: [],
      jobContact: 'a@b',
      createdBy: rec2._id,
      jobStatus: 'declined',
    });

    // login as admin
    const agent = getAgent();
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'Password1!' })
      .expect(200);
    const cookies = login.headers['set-cookie'];
    expect(cookies && cookies.length).toBeGreaterThan(0);

    const res = await agent
      .get('/api/v1/admin/info')
      .set('Cookie', cookies)
      .expect(200);

    // keys exist and counts match (users = admin + recruiters + applicants => 6)
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('admins');
    expect(res.body).toHaveProperty('recruiters');
    expect(res.body).toHaveProperty('applicants');
    expect(res.body).toHaveProperty('jobs');
    expect(res.body).toHaveProperty('interviews');
    expect(res.body).toHaveProperty('pending');
    expect(res.body).toHaveProperty('rejected');

    expect(res.body.users).toBe(6);
    expect(res.body.admins).toBe(1);
    expect(res.body.recruiters).toBe(2);
    expect(res.body.applicants).toBe(3);
    expect(res.body.jobs).toBe(3);
    expect(res.body.pending).toBe(1);
    expect(res.body.interviews).toBe(1);
    expect(res.body.rejected).toBe(1);
  }, 20000);

  it('GET /api/v1/admin/stats returns defaultStats & monthly_stats (formatted and chronological)', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const JobModel = (await import('../../src/models/Job.js')).default;

    // create admin & recruiter
    const admin = await factories.createUser({
      email: `admin2-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'admin',
      username: 'theadmin2',
      isAccountVerified: true,
    });
    const rec = await factories.createUser({
      email: `rec-stats-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      username: 'recstats',
      isAccountVerified: true,
    });

    // create jobs across months (explicit createdAt)
    // We'll create jobs in Jan, Feb, Mar, Apr, May, Jun (year 2026 example)
    const months = [
      { month: 0, count: 1 }, // Jan 2026
      { month: 1, count: 2 }, // Feb
      { month: 2, count: 0 }, // Mar (skip)
      { month: 3, count: 1 }, // Apr
      { month: 4, count: 3 }, // May
      { month: 5, count: 1 }, // Jun
    ];

    // assign statuses arbitrarily so defaultStats can be checked
    const statuses = ['pending', 'interview', 'declined'];

    const jobsToInsert: any[] = [];
    months.forEach((m, mi) => {
      for (let i = 0; i < m.count; i++) {
        const createdAt = new Date(2026, m.month, 5 + i); // day 5,6,...
        jobsToInsert.push({
          company: `J-${m.month}-${i}`,
          position: `Pos ${m.month}-${i}`,
          jobDescription: 'descdesc',
          jobLocation: 'loc',
          jobVacancy: '1',
          jobSalary: '0',
          jobDeadline: '2099-01-01',
          jobSkills: ['x'],
          jobFacilities: [],
          jobContact: 'a@b',
          createdBy: rec._id,
          jobStatus: statuses[(mi + i) % statuses.length],
          createdAt,
          updatedAt: createdAt,
        });
      }
    });

    if (jobsToInsert.length > 0) {
      await JobModel.insertMany(jobsToInsert);
    }

    // login admin & call stats
    const agent = getAgent();
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'Password1!' })
      .expect(200);
    const cookies = login.headers['set-cookie'];

    const res = await agent
      .get('/api/v1/admin/stats')
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body).toHaveProperty('defaultStats');
    expect(res.body).toHaveProperty('monthly_stats');

    // defaultStats is array with objects { name, value } for pending/interview/rejected
    const defaultStats = res.body.defaultStats;
    expect(Array.isArray(defaultStats)).toBeTruthy();
    // ensure keys exist
    const names = defaultStats.map((s: any) => s.name);
    expect(names).toContain('pending');
    expect(names).toContain('interview');
    expect(names).toContain('rejected');

    // monthly_stats should be chronological (oldest -> newest); format 'MMM YY'
    const monthly = res.body.monthly_stats;
    expect(Array.isArray(monthly)).toBeTruthy();
    // length <= 6 (aggregation limits to 6)
    expect(monthly.length).toBeLessThanOrEqual(6);

    // verify formatting matches dayjs('YYYY-MM-DD').format('MMM YY')
    monthly.forEach((it: any) => {
      // 'MMM YY' example: Jan 26
      const parsed = dayjs(it.date, 'MMM YY', true);
      expect(parsed.isValid()).toBeTruthy();
      expect(typeof it.count).toBe('number');
    });

    // check that sequence is non-decreasing in time(optional but i added it anyway)
    const monthsParsed = monthly.map((m: any) => dayjs(m.date, 'MMM YY'));
    for (let i = 1; i < monthsParsed.length; i++) {
      expect(
        monthsParsed[i].isAfter(monthsParsed[i - 1]) ||
          monthsParsed[i].isSame(monthsParsed[i - 1]),
      ).toBeTruthy();
    }
  });

  it('Admin can list users (GET /api/v1/users) and get single user; update role via PATCH /api/v1/admin/update-role', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');
    const UserModel = (await import('../../src/models/User.js')).default;

    // seed: admin + some users
    const admin = await factories.createUser({
      email: `admin3-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'admin',
      username: 'theadmin3',
      isAccountVerified: true,
    });

    const user = await factories.createUser({
      email: `plain-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'user',
      username: 'plainuser',
      isAccountVerified: true,
    });

    // login as admin
    const agent = getAgent();
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'Password1!' })
      .expect(200);
    const cookies = login.headers['set-cookie'];

    // GET /api/v1/users (admin-only)
    const listRes = await agent
      .get('/api/v1/users')
      .set('Cookie', cookies)
      .expect(200);

    expect(listRes.body).toHaveProperty('users');
    expect(Array.isArray(listRes.body.users)).toBeTruthy();
    // check password excluded
    const firstUser = listRes.body.users.find(
      (u: any) => u.email === user.email,
    );
    expect(firstUser).toBeTruthy();
    expect(firstUser).not.toHaveProperty('password');

    // GET single
    const singleRes = await agent
      .get(`/api/v1/users/${user._id}`)
      .set('Cookie', cookies)
      .expect(200);
    expect(singleRes.body).toHaveProperty('data');
    expect(singleRes.body.data.email).toBe(user.email);
    expect(singleRes.body.data).not.toHaveProperty('password');

    // update role
    const patchRes = await agent
      .patch('/api/v1/admin/update-role')
      .set('Cookie', cookies)
      .send({ id: user._id.toString(), role: 'recruiter' })
      .expect(200);
    expect(patchRes.body).toHaveProperty('status', true);

    // confirm role in DB
    const updated = await UserModel.findById(user._id).lean().exec();
    expect(updated!.role).toBe('recruiter');
  });
});
