import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { startTestDB, clearDB, stopTestDB } from '../helpers/db.js';
import { APP_STATUS } from '../../src/utils/constants.js';

beforeAll(async () => {
  await startTestDB();
});

afterAll(async () => {
  await stopTestDB();
});

beforeEach(async () => {
  await clearDB();
});

describe('Application model', () => {
  it('defaults status to pending and dateOfApplication is set', async () => {
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const app = new Application({
      applicantId: new mongoose.Types.ObjectId(),
      recruiterId: new mongoose.Types.ObjectId(),
      jobId: new mongoose.Types.ObjectId(),
    });

    await app.save();

    expect(app.status).toBe(APP_STATUS.PENDING);
    expect(app.dateOfApplication).toBeDefined();
    expect(app.dateOfApplication instanceof Date).toBe(true);
  });

  it('allows dateOfJoining greater than or equal to dateOfApplication', async () => {
    const Application = (await import('../../src/models/Application.js'))
      .default as any;

    const dto = {
      applicantId: new mongoose.Types.ObjectId(),
      recruiterId: new mongoose.Types.ObjectId(),
      jobId: new mongoose.Types.ObjectId(),
      dateOfApplication: new Date('2023-01-01T00:00:00Z'),
      dateOfJoining: new Date('2023-01-02T00:00:00Z'),
    };

    const app = new Application(dto);
    await expect(app.save()).resolves.toBeDefined();
  });

  it('rejects when dateOfJoining is before dateOfApplication', async () => {
    const Application = (await import('../../src/models/Application.js'))
      .default as any;

    const dto = {
      applicantId: new mongoose.Types.ObjectId(),
      recruiterId: new mongoose.Types.ObjectId(),
      jobId: new mongoose.Types.ObjectId(),
      dateOfApplication: new Date('2023-01-10T00:00:00Z'),
      dateOfJoining: new Date('2023-01-05T00:00:00Z'),
    };

    const app = new Application(dto);
    await expect(app.save()).rejects.toThrow(
      /dateOfJoining should be greater than dateOfApplication/i,
    );
  });

  it('allows omitting dateOfJoining', async () => {
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const app = new Application({
      applicantId: new mongoose.Types.ObjectId(),
      recruiterId: new mongoose.Types.ObjectId(),
      jobId: new mongoose.Types.ObjectId(),
    });

    await expect(app.save()).resolves.toBeDefined();
  });
});
