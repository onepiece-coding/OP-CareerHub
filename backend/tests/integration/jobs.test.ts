import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { getAgent } from '../helpers/server.js';
import * as factories from '../helpers/factories.js';
import JobModel from '../../src/models/Job.js';

beforeEach(async () => {
  vi.resetAllMocks();
  const cols = mongoose.connection.collections;
  for (const k of Object.keys(cols)) {
    // @ts-ignore
    await cols[k].deleteMany({});
  }
});

describe('Integration — Jobs CRUD, listing, permissions', () => {
  it('create: recruiter can create job (persisted & returned)', async () => {
    const email = `rec-create-${Date.now()}@example.test`;
    const password = 'Password1!';

    await factories.createUser({
      email,
      password,
      role: 'recruiter',
      isAccountVerified: true,
    });

    const agent = getAgent();
    const loginRes = await agent
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);
    const cookies = (loginRes.headers['set-cookie'] || []) as string[];

    const payload = {
      company: 'TestCorp LTD',
      position: 'Senior Tester',
      jobDescription: 'Test things thoroughly and document results',
      jobLocation: 'Remote',
      jobVacancy: '1',
      jobSalary: '1000',
      jobDeadline: '2026-12-31',
      jobSkills: 'nodejs, testing',
      jobFacilities: ['health', 'gym'],
      jobContact: 'hr@testcorp.example',
    };

    const res = await agent
      .post('/api/v1/jobs')
      .set('Cookie', cookies)
      .send(payload)
      .expect(201);

    // controller wraps created job under result
    expect(res.body).toHaveProperty('result');
    expect(res.body.result).toHaveProperty('company', payload.company);

    const found = await JobModel.findOne({ company: payload.company }).exec();
    expect(found).toBeTruthy();
    expect(String(found!.position)).toContain('Senior Tester');
  });

  it('update: owner (recruiter who created job) can update; non-owner cannot', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');

    // create two recruiter accounts
    const ownerData = {
      email: `owner-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
      username: 'owner',
    };
    const otherData = {
      email: `other-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
      username: 'other',
    };

    await factories.createUser(ownerData);
    await factories.createUser(otherData);

    const agent = getAgent();

    // login owner and capture cookies
    const loginOwnerRes = await agent
      .post('/api/v1/auth/login')
      .send({ email: ownerData.email, password: ownerData.password })
      .expect(200);
    const ownerCookies = loginOwnerRes.headers['set-cookie'];
    expect(ownerCookies && ownerCookies.length).toBeGreaterThan(0);

    // login other and capture cookies
    const agent2 = getAgent();
    const loginOtherRes = await agent2
      .post('/api/v1/auth/login')
      .send({ email: otherData.email, password: otherData.password })
      .expect(200);
    const otherCookies = loginOtherRes.headers['set-cookie'];
    expect(otherCookies && otherCookies.length).toBeGreaterThan(0);

    // owner creates a job (attach owner's cookies explicitly)
    const payload = {
      company: 'TestCorp',
      position: 'Backend Engineer',
      jobDescription: 'Great role working on backend services',
      jobLocation: 'Remote',
      jobVacancy: '1',
      jobSalary: '$5000',
      jobDeadline: '2099-12-31',
      jobSkills: ['node', 'mongodb'],
      jobFacilities: ['remote'],
      jobContact: 'hr@testcorp.example',
    };

    const createRes = await agent
      .post('/api/v1/jobs')
      .set('Cookie', ownerCookies)
      .send(payload)
      .expect(201);

    // response payload shape may be { status: true, result } or result at top-level
    const createdJob = createRes.body.result ?? createRes.body;
    const jobId = createdJob._id ?? createdJob.id ?? createdJob.result?._id;
    expect(jobId).toBeTruthy();

    // owner updates -> should succeed
    const updRes = await agent
      .patch(`/api/v1/jobs/${jobId}`)
      .set('Cookie', ownerCookies)
      .send({ position: 'Updated Position' })
      .expect(200);
    expect(updRes.body).toHaveProperty('result');

    // other (authenticated recruiter but not owner) attempts update -> should be 403
    await agent2
      .patch(`/api/v1/jobs/${jobId}`)
      .set('Cookie', otherCookies)
      .send({ position: 'Malicious' })
      .expect(403);
  });

  it('delete: owner can delete; non-owner cannot', async () => {
    const owner = await factories.createUser({
      email: `delowner-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
    });

    const job = await JobModel.create({
      company: 'DelCorp Ltd',
      position: 'ToDelete Position',
      jobDescription: 'Description long enough for validation',
      jobContact: 'a@a.example',
      createdBy: owner._id,
      jobLocation: 'loc',
      jobVacancy: '1',
      jobSalary: '0',
      jobDeadline: '2026-01-01',
    });

    const agentOwner = getAgent();
    const loginOwner = await agentOwner
      .post('/api/v1/auth/login')
      .send({ email: owner.email, password: 'Password1!' })
      .expect(200);
    const ownerCookies = (loginOwner.headers['set-cookie'] || []) as string[];

    await agentOwner
      .delete(`/api/v1/jobs/${job._id}`)
      .set('Cookie', ownerCookies)
      .expect(200);

    const found = await JobModel.findById(job._id).exec();
    expect(found).toBeNull();

    const job2 = await JobModel.create({
      company: 'DelCorp2 Ltd',
      position: 'NotDelete Position',
      jobDescription: 'Another valid description string',
      jobContact: 'a@a.example',
      createdBy: owner._id,
      jobLocation: 'loc2',
      jobVacancy: '1',
      jobSalary: '0',
      jobDeadline: '2026-01-01',
    });

    const other = await factories.createUser({
      email: `deleter-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
    });
    const agentOther = getAgent();
    const loginOther = await agentOther
      .post('/api/v1/auth/login')
      .send({ email: other.email, password: 'Password1!' })
      .expect(200);
    const otherCookies = (loginOther.headers['set-cookie'] || []) as string[];

    await agentOther
      .delete(`/api/v1/jobs/${job2._id}`)
      .set('Cookie', otherCookies)
      .expect(403);
  });

  it('listing & pagination: seeds many jobs and returns correct pagination', async () => {
    const creator = await factories.createUser({
      email: `pager-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
    });

    const jobsToCreate = Array.from({ length: 25 }).map((_, i) => ({
      company: `PagerCompany ${i}`,
      position: `Position ${i}`,
      jobDescription: `Detailed description ${i} long enough`,
      jobContact: `c${i}@example.test`,
      createdBy: creator._id,
      jobLocation: `Location ${i}`,
      jobVacancy: '1',
      jobSalary: '0',
      jobDeadline: '2026-01-01',
    }));
    await JobModel.insertMany(jobsToCreate);

    const agent = getAgent();
    const resPage1 = await agent.get('/api/v1/jobs?page=1').expect(200);
    expect(resPage1.body).toHaveProperty('data');
    expect(Array.isArray(resPage1.body.data)).toBe(true);
    expect(resPage1.body.data.length).toBeGreaterThanOrEqual(1);
    expect(resPage1.body).toHaveProperty('pagination');
    expect(resPage1.body.pagination.totalPages).toBeGreaterThanOrEqual(5);

    const resPage2 = await agent.get('/api/v1/jobs?page=2').expect(200);
    expect(resPage2.body).toHaveProperty('data');
    expect(JSON.stringify(resPage1.body.data)).not.toEqual(
      JSON.stringify(resPage2.body.data),
    );
  });

  it('search & filters: position text & jobStatus filters work', async () => {
    const recruiter = await factories.createUser({
      email: `search-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
    });

    await JobModel.insertMany([
      {
        company: 'FilterCorp Ltd',
        position: 'Backend Engineer',
        jobDescription: 'Backend engineer role with enough description',
        jobContact: 'a@a.example',
        createdBy: recruiter._id,
        jobLocation: 'X',
        jobVacancy: '1',
        jobSalary: '0',
        jobDeadline: '2027-01-01',
        jobStatus: 'pending',
      },
      {
        company: 'FilterCorp Ltd',
        position: 'Frontend Engineer',
        jobDescription: 'Frontend engineer role with enough description',
        jobContact: 'b@b.example',
        createdBy: recruiter._id,
        jobLocation: 'Y',
        jobVacancy: '1',
        jobSalary: '0',
        jobDeadline: '2027-01-01',
        jobStatus: 'interview',
      },
    ]);

    const agent = getAgent();
    const r1 = await agent.get('/api/v1/jobs?search=Engineer').expect(200);
    expect(r1.body.data.length).toBeGreaterThanOrEqual(2);

    const r2 = await agent.get('/api/v1/jobs?jobStatus=interview').expect(200);
    expect(
      r2.body.data.every((j: any) => j.jobStatus === 'interview'),
    ).toBeTruthy();
  });
});
