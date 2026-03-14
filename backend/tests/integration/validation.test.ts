import { describe, it, beforeEach, expect } from 'vitest';
import mongoose from 'mongoose';

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const k of Object.keys(collections)) {
    // @ts-ignore
    await collections[k].deleteMany({});
  }
});

describe('Integration — Validation & error responses', () => {
  it('Zod validation -> invalid register body returns 400 with structured errors', async () => {
    const { getAgent } = await import('../helpers/server.js');
    const agent = getAgent();

    // missing password + bad email + short username => should trigger zod validation
    const res = await agent
      .post('/api/v1/auth/register')
      .send({
        username: 'a',
        email: 'not-an-email',
      })
      .expect(400);

    expect(res.body).toHaveProperty('message', 'Validation failed');
    expect(res.body).toHaveProperty('errors');
    expect(typeof res.body.errors).toBe('object');
    // body-level errors should be present
    expect(res.body.errors.body).toBeTruthy();
  }, 20000);

  it('Zod validation -> invalid job creation returns 400 with structured errors', async () => {
    const factories = await import('../helpers/factories.js');
    const { getAgent } = await import('../helpers/server.js');

    // create a recruiter (route /api/v1/jobs protected by authenticate + authorizeRoles('recruiter'))
    const rec = await factories.createUser({
      email: `job-err-${Date.now()}@example.test`,
      password: 'Password1!',
      role: 'recruiter',
      isAccountVerified: true,
    });

    const agent = getAgent();
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: rec.email, password: 'Password1!' })
      .expect(200);
    const cookies = login.headers['set-cookie'];

    // invalid job payload (company & position too short -> validateAddJob should fail)
    const res = await agent
      .post('/api/v1/jobs')
      .set('Cookie', cookies)
      .send({
        company: 'X',
        position: 'P1',
        jobDescription: 'descdesc',
        jobLocation: 'loc',
        jobVacancy: '1',
        jobSalary: '1000',
        jobDeadline: '2099-01-01',
        jobSkills: ['x'],
        jobFacilities: [],
        jobContact: 'a@b',
      })
      .expect(400);

    expect(res.body).toHaveProperty('message', 'Validation failed');
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors.body).toBeTruthy();
  });

  it('validateObjectIdParam -> invalid ObjectId param returns 400 with structured param error', async () => {
    const { getAgent } = await import('../helpers/server.js');
    const agent = getAgent();

    // userRoutes uses validateObjectIdParam('id') on GET /api/v1/users/:id (admin-only, but validation runs before auth)
    const res = await agent.get('/api/v1/users/not-a-valid-id').expect(400);

    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
    // message should mention invalid parameter
    expect(res.body.message.toLowerCase()).toContain('invalid parameter');
    // structured errors attached by createError in validateObjectIdParam
    expect(res.body.errors).toBeTruthy();
  });

  it('notFound middleware -> unknown route returns 404 and "Not Found - <url>" message', async () => {
    const { getAgent } = await import('../helpers/server.js');
    const agent = getAgent();

    const path = '/api/v1/this-route-does-not-exist';
    const res = await agent.get(path).expect(404);

    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Not Found');
    expect(res.body.message).toContain(path);
  });

  it('errorHandler mongoose branch -> returns 400 with "Validation failed" and errors object', async () => {
    // Import errorHandler to call directly (unit-style), using fake req/res
    const { errorHandler } = await import('../../src/middlewares/error.js');

    // create a fake Mongoose-like ValidationError
    // structure: { name: 'ValidationError', errors: { field: { message: '...' } } }
    const fakeMongooseErr: any = new Error('Validation failed');
    fakeMongooseErr.name = 'ValidationError';
    fakeMongooseErr.errors = {
      company: { message: 'company: Path `company` is required.' },
      position: { message: 'position: Path `position` is too short.' },
    };

    // create fake res with spies
    const jsonCalls: any[] = [];
    const fakeRes: any = {
      status(code: number) {
        this._status = code;
        return this;
      },
      json(payload: any) {
        jsonCalls.push(payload);
        this._json = payload;
        return this;
      },
    };

    // call handler
    // signature: (err, req, res, next)
    // req/next not used in the mongoose branch; pass empty values
    errorHandler(fakeMongooseErr, {} as any, fakeRes as any, () => {});

    // assert response captured
    expect(fakeRes._status).toBe(400);
    expect(fakeRes._json).toHaveProperty('message', 'Validation failed');
    expect(fakeRes._json).toHaveProperty('errors');
    expect(fakeRes._json.errors.company).toBeTruthy();
    expect(fakeRes._json.errors.position).toBeTruthy();
  });
});
