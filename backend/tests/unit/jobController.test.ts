import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ----------------- Hoist-safe mocks -----------------
vi.mock('../../src/services/socketService.js', () => {
  return {
    sendNotification: vi.fn(),
  };
});

class MockJob {
  constructor(private data: any) {
    // instance-level save mock
    (this as any).save = vi
      .fn()
      .mockResolvedValue({ ...data, _id: 'new-job-id' });
  }

  // static methods used by controllers
  static find = vi.fn();
  static countDocuments = vi.fn();
  static findById = vi.fn();
  static findOne = vi.fn();
  static findByIdAndUpdate = vi.fn();
  static findByIdAndDelete = vi.fn();
  static deleteMany = vi.fn();
}

vi.mock('../../src/models/Job.js', () => ({ default: MockJob }));

vi.mock('../../src/models/Application.js', () => {
  return {
    default: {
      deleteMany: vi.fn(),
      find: vi.fn(),
    },
  };
});

vi.mock('../../src/models/Notification.js', () => {
  return {
    default: {
      insertMany: vi.fn(),
    },
  };
});
// ----------------- End mocks -----------------

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('job controllers (unit)', () => {
  it('getAllJobsCtrl returns jobs with pagination', async () => {
    const Job = (await import('../../src/models/Job.js')).default as any;
    const mod = await import('../../src/controllers/jobController.js');

    const fakeJobs = [
      { _id: 'j1', position: 'p1' },
      { _id: 'j2', position: 'p2' },
    ];

    // Mock chainable Job.find(...).sort(...).select(...).skip(...).limit(...).lean()
    (Job.find as any).mockImplementation(() => {
      return {
        sort: (_: any) => ({
          select: (_: any) => ({
            skip: (_: number) => ({
              limit: (_: number) => ({
                lean: () => Promise.resolve(fakeJobs),
              }),
            }),
          }),
        }),
      };
    });

    Job.countDocuments.mockResolvedValueOnce(12);

    const req: any = { query: {} };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.getAllJobsCtrl(req, res, vi.fn());

    expect(Job.find).toHaveBeenCalled();
    expect(Job.countDocuments).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        count: fakeJobs.length,
        total: 12,
        data: fakeJobs,
      }),
    );
  });

  it('getMyJobsCtrl returns jobs for recruiter and 404 when none found', async () => {
    const Job = (await import('../../src/models/Job.js')).default as any;
    const mod = await import('../../src/controllers/jobController.js');

    const jobs = [{ _id: 'j1' }];
    (Job.find as any).mockImplementationOnce(() => ({
      populate: (_: any, __: any) => Promise.resolve(jobs),
    }));

    const req1: any = { user: { _id: 'rec1' } };
    const res1: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.getMyJobsCtrl(req1, res1, vi.fn());
    expect(Job.find).toHaveBeenCalledWith({ createdBy: 'rec1' });
    expect(res1.status).toHaveBeenCalledWith(200);
    expect(res1.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: true, data: jobs }),
    );

    // not found case
    (Job.find as any).mockImplementationOnce(() => ({
      populate: (_: any, __: any) => Promise.resolve([]),
    }));
    const req2: any = { user: { _id: 'rec2' } };
    const res2: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next2 = vi.fn();

    await mod.getMyJobsCtrl(req2, res2, next2);
    expect(next2).toHaveBeenCalled();
    const err = next2.mock.calls[0][0];
    expect(String(err.message)).toMatch(/No jobs found for this recruiter/i);
  });

  it('getSingleJobCtrl returns job when found and passes error when not', async () => {
    const Job = (await import('../../src/models/Job.js')).default as any;
    const mod = await import('../../src/controllers/jobController.js');

    // found
    (Job.findById as any).mockResolvedValueOnce({ _id: 'j1' });
    const req1: any = { params: { id: 'j1' } };
    const res1: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await mod.getSingleJobCtrl(req1, res1, vi.fn());
    expect(res1.status).toHaveBeenCalledWith(200);
    expect(res1.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: true, result: { _id: 'j1' } }),
    );

    // not found
    (Job.findById as any).mockResolvedValueOnce(null);
    const req2: any = { params: { id: 'nope' } };
    const res2: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next2 = vi.fn();
    await mod.getSingleJobCtrl(req2, res2, next2);
    expect(next2).toHaveBeenCalled();
    expect(String(next2.mock.calls[0][0].message)).toMatch(/Job not found/i);
  });

  it('addJobCtrl returns 409 if job exists and 201 on success', async () => {
    const Job = (await import('../../src/models/Job.js')).default as any;
    const mod = await import('../../src/controllers/jobController.js');

    // conflict
    (Job.findOne as any).mockResolvedValueOnce({ _id: 'existing' });
    const req0: any = {
      body: { company: 'c', position: 'p', jobVacancy: 1 },
      user: { _id: 'u1' },
    };
    const res0: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next0 = vi.fn();
    await mod.addJobCtrl(req0, res0, next0);
    expect(next0).toHaveBeenCalled();
    expect(String(next0.mock.calls[0][0].message)).toMatch(
      /Job already exists/i,
    );

    // success path: findOne returns null
    (Job.findOne as any).mockResolvedValueOnce(null);
    // ensure constructor returns instance with save -> our mockJobConstructor already returns such an object
    const req1: any = {
      body: { company: 'c2', position: 'p2', jobVacancy: 2 },
      user: { _id: 'u2' },
    };
    const res1: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.addJobCtrl(req1, res1, vi.fn());

    expect(res1.status).toHaveBeenCalledWith(201);
    expect(res1.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: true,
        result: expect.objectContaining({ _id: 'new-job-id' }),
      }),
    );
  });

  it('updateSingleJobCtrl handles not found, nothing to update and success with notifications', async () => {
    const Job = (await import('../../src/models/Job.js')).default as any;
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const Notification = (await import('../../src/models/Notification.js'))
      .default as any;
    const socket = await import('../../src/services/socketService.js');
    const mod = await import('../../src/controllers/jobController.js');

    // not found
    (Job.findOne as any).mockResolvedValueOnce(null);
    const req0: any = { params: { id: 'x' }, body: {} };
    const res0: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next0 = vi.fn();
    await mod.updateSingleJobCtrl(req0, res0, next0);
    expect(next0).toHaveBeenCalled();
    expect(String(next0.mock.calls[0][0].message)).toMatch(/Job not found/i);

    // nothing to update (jobStatus same)
    const jobBefore = { _id: 'j2', jobStatus: 'open', createdBy: 'rec1' };
    (Job.findOne as any).mockResolvedValueOnce(jobBefore);
    const req1: any = {
      params: { id: 'j2' },
      body: { jobStatus: 'open' },
      user: { _id: 'rec1' },
    };
    const res1: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next1 = vi.fn();
    await mod.updateSingleJobCtrl(req1, res1, next1);
    expect(next1).toHaveBeenCalled();
    expect(String(next1.mock.calls[0][0].message)).toMatch(
      /Nothing to update/i,
    );

    // success path
    const updatedJob = { _id: 'j3', jobStatus: 'closed' };
    (Job.findOne as any).mockResolvedValueOnce({
      _id: 'j3',
      jobStatus: 'open',
      createdBy: 'rec2',
    });
    (Job.findByIdAndUpdate as any).mockResolvedValueOnce(updatedJob);

    // applications that applied to this job
    const apps = [
      { applicantId: 'a1', _id: 'app1' },
      { applicantId: 'a2', _id: 'app2' },
    ];
    (Application.find as any).mockResolvedValueOnce(apps);

    Notification.insertMany.mockResolvedValueOnce([
      { recipient: 'a1' },
      { recipient: 'a2' },
    ]);

    const req2: any = {
      params: { id: 'j3' },
      body: { jobStatus: 'closed' },
      user: { _id: 'rec2' },
    };
    const res2: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.updateSingleJobCtrl(req2, res2, vi.fn());

    // Notification insert and sendNotification invoked for each application
    expect(Notification.insertMany).toHaveBeenCalled();
    expect(socket.sendNotification).toHaveBeenCalledTimes(2);
    expect(res2.status).toHaveBeenCalledWith(200);
    expect(res2.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: true,
        message: 'Job Updated',
        result: updatedJob,
      }),
    );
  });

  it('deleteSingleJobCtrl returns 404 when missing and deletes when present', async () => {
    const Job = (await import('../../src/models/Job.js')).default as any;
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const mod = await import('../../src/controllers/jobController.js');

    // not found
    (Job.findOne as any).mockResolvedValueOnce(null);
    const req0: any = { params: { id: 'no' } };
    const res0: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next0 = vi.fn();
    await mod.deleteSingleJobCtrl(req0, res0, next0);
    expect(next0).toHaveBeenCalled();
    expect(String(next0.mock.calls[0][0].message)).toMatch(/Job not Found/i);

    // success deletion
    (Job.findOne as any).mockResolvedValueOnce({
      _id: 'jdel',
      createdBy: 'recDel',
    });
    (Application.deleteMany as any).mockResolvedValueOnce({ deletedCount: 3 });
    (Job.findByIdAndDelete as any).mockResolvedValueOnce({ _id: 'jdel' });

    const req1: any = { params: { id: 'jdel' }, user: { _id: 'recDel' } };
    const res1: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.deleteSingleJobCtrl(req1, res1, vi.fn());

    expect(Application.deleteMany).toHaveBeenCalledWith({ jobId: 'jdel' });
    expect(Job.findByIdAndDelete).toHaveBeenCalledWith('jdel');
    expect(res1.status).toHaveBeenCalledWith(200);
    expect(res1.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: true, message: 'Job deleted' }),
    );
  });

  it('deleteAllJobsCtrl deletes applications when jobs exist and returns result', async () => {
    const Job = (await import('../../src/models/Job.js')).default as any;
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const mod = await import('../../src/controllers/jobController.js');

    // jobs present
    (Job.find as any).mockResolvedValueOnce([{ _id: 'j1' }, { _id: 'j2' }]);
    (Application.deleteMany as any).mockResolvedValueOnce({ deletedCount: 4 });
    (Job.deleteMany as any).mockResolvedValueOnce({ deletedCount: 2 });

    const req: any = { query: {} };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.deleteAllJobsCtrl(req, res, vi.fn());

    expect(Application.deleteMany).toHaveBeenCalledWith({
      jobId: { $in: ['j1', 'j2'] },
    });
    expect(Job.deleteMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: true }),
    );
  });
});
