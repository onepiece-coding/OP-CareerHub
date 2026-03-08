import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------- HOIST SAFE MOCKS ----------------

vi.mock('../../src/services/socketService.js', () => ({
  sendNotification: vi.fn(),
}));

class MockApplication {
  constructor(private data: any) {
    (this as any).save = vi.fn().mockResolvedValue({
      ...data,
      _id: 'app-new-id',
    });
  }

  static find = vi.fn();
  static findOne = vi.fn();
  static findByIdAndUpdate = vi.fn();
  static countDocuments = vi.fn();
}

class MockJob {
  static findById = vi.fn();
}

class MockUser {
  static findById = vi.fn();
}

class MockNotification {
  static create = vi.fn();
}

vi.mock('../../src/models/Application.js', () => ({
  default: MockApplication,
}));

vi.mock('../../src/models/Job.js', () => ({
  default: MockJob,
}));

vi.mock('../../src/models/User.js', () => ({
  default: MockUser,
}));

vi.mock('../../src/models/Notification.js', () => ({
  default: MockNotification,
}));

// --------------------------------------------------

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('application controllers (unit)', () => {
  /* ======================================================
     GET CANDIDATE APPLICATIONS
  ====================================================== */

  it('getCandidateApplicationsCtrl returns applications with pagination', async () => {
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const mod = await import('../../src/controllers/applicationController.js');

    const apps = [{ _id: 'a1' }, { _id: 'a2' }];

    (Application.find as any).mockImplementation(() => ({
      sort: () => ({
        select: () => ({
          skip: () => ({
            limit: () => ({
              populate: () => ({
                lean: () => Promise.resolve(apps),
              }),
            }),
          }),
        }),
      }),
    }));

    Application.countDocuments.mockResolvedValueOnce(12);

    const req: any = {
      user: { _id: 'user1' },
      query: {},
    };

    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await mod.getCandidateApplicationsCtrl(req, res, vi.fn());

    expect(Application.find).toHaveBeenCalledWith({ applicantId: 'user1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        count: apps.length,
        total: 12,
        data: apps,
      }),
    );
  });

  /* ======================================================
     GET RECRUITER APPLICATIONS
  ====================================================== */

  it('getRecruiterJobsApplicationsCtrl returns recruiter applications', async () => {
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const mod = await import('../../src/controllers/applicationController.js');

    const result = [{ _id: 'app1' }];

    (Application.find as any).mockImplementation(() => ({
      populate: () => Promise.resolve(result),
    }));

    Application.countDocuments.mockResolvedValueOnce(1);

    const req: any = { user: { _id: 'rec1' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.getRecruiterJobsApplicationsCtrl(req, res, vi.fn());

    expect(Application.find).toHaveBeenCalledWith({ recruiterId: 'rec1' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getRecruiterJobsApplicationsCtrl throws when no applications', async () => {
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const mod = await import('../../src/controllers/applicationController.js');

    (Application.find as any).mockImplementation(() => ({
      populate: () => Promise.resolve([]),
    }));

    const req: any = { user: { _id: 'rec1' } };
    const res: any = { status: vi.fn(), json: vi.fn() };
    const next = vi.fn();

    await mod.getRecruiterJobsApplicationsCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(String(next.mock.calls[0][0].message)).toMatch(
      /No Application is found/i,
    );
  });

  /* ======================================================
     APPLY IN JOB
  ====================================================== */

  it('applyInJobCtrl prevents duplicate application', async () => {
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const mod = await import('../../src/controllers/applicationController.js');

    Application.findOne.mockResolvedValueOnce({ _id: 'exists' });

    const req: any = {
      body: { jobId: 'j1' },
      user: { _id: 'user1' },
    };

    const next = vi.fn();
    const res: any = { status: vi.fn(), json: vi.fn() };

    await mod.applyInJobCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(String(next.mock.calls[0][0].message)).toMatch(/Already Applied/i);
  });

  it('applyInJobCtrl throws if job not found', async () => {
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const Job = (await import('../../src/models/Job.js')).default as any;
    const mod = await import('../../src/controllers/applicationController.js');

    Application.findOne.mockResolvedValueOnce(null);

    Job.findById.mockImplementationOnce(() => ({
      select: () => Promise.resolve(null),
    }));

    const req: any = {
      body: { jobId: 'j1' },
      user: { _id: 'user1' },
    };

    const next = vi.fn();
    const res: any = { status: vi.fn(), json: vi.fn() };

    await mod.applyInJobCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(String(next.mock.calls[0][0].message)).toMatch(/Job not found/i);
  });

  it('applyInJobCtrl requires resume', async () => {
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const Job = (await import('../../src/models/Job.js')).default as any;
    const User = (await import('../../src/models/User.js')).default as any;
    const mod = await import('../../src/controllers/applicationController.js');

    Application.findOne.mockResolvedValueOnce(null);

    Job.findById.mockImplementationOnce(() => ({
      select: () => Promise.resolve({ createdBy: 'rec1' }),
    }));

    User.findById.mockImplementationOnce(() => ({
      select: () => Promise.resolve({ resume: {} }),
    }));

    const req: any = {
      body: { jobId: 'j1' },
      user: { _id: 'user1' },
    };

    const next = vi.fn();
    const res: any = { status: vi.fn(), json: vi.fn() };

    await mod.applyInJobCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(String(next.mock.calls[0][0].message)).toMatch(/upload a resume/i);
  });

  it('applyInJobCtrl applies successfully and sends notification', async () => {
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const Job = (await import('../../src/models/Job.js')).default as any;
    const User = (await import('../../src/models/User.js')).default as any;
    const Notification = (await import('../../src/models/Notification.js'))
      .default as any;
    const socket = await import('../../src/services/socketService.js');
    const mod = await import('../../src/controllers/applicationController.js');

    Application.findOne.mockResolvedValueOnce(null);

    Job.findById.mockImplementationOnce(() => ({
      select: () => Promise.resolve({ createdBy: 'rec1' }),
    }));

    User.findById.mockImplementationOnce(() => ({
      select: () =>
        Promise.resolve({
          resume: { url: 'url', publicId: 'pid' },
        }),
    }));

    Notification.create.mockResolvedValueOnce({});

    const req: any = {
      body: { jobId: 'j1' },
      user: { _id: 'user1' },
    };

    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.applyInJobCtrl(req, res, vi.fn());

    expect(Notification.create).toHaveBeenCalled();
    expect(socket.sendNotification).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  /* ======================================================
     UPDATE APPLICATION STATUS
  ====================================================== */

  it('updateApplicationStatusCtrl rejects unauthorized recruiter', async () => {
    const Job = (await import('../../src/models/Job.js')).default as any;
    const mod = await import('../../src/controllers/applicationController.js');

    Job.findById.mockImplementationOnce(() => ({
      select: () => Promise.resolve({ createdBy: 'owner1' }),
    }));

    const req: any = {
      params: { id: 'app1' },
      body: { jobId: 'j1', status: 'accepted' },
      user: { _id: 'other' },
    };

    const next = vi.fn();
    const res: any = { status: vi.fn(), json: vi.fn() };

    await mod.updateApplicationStatusCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(String(next.mock.calls[0][0].message)).toMatch(/Not authorized/i);
  });

  it('updateApplicationStatusCtrl updates status and sends notification', async () => {
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const Job = (await import('../../src/models/Job.js')).default as any;
    const Notification = (await import('../../src/models/Notification.js'))
      .default as any;
    const socket = await import('../../src/services/socketService.js');
    const mod = await import('../../src/controllers/applicationController.js');

    Job.findById.mockImplementationOnce(() => ({
      select: () => Promise.resolve({ createdBy: 'rec1' }),
    }));

    Application.findOne.mockResolvedValueOnce({
      _id: 'app1',
      status: 'pending',
    });

    Application.findByIdAndUpdate.mockResolvedValueOnce({
      _id: 'app1',
      status: 'accepted',
      applicantId: 'user1',
    });

    Notification.create.mockResolvedValueOnce({});

    const req: any = {
      params: { id: 'app1' },
      body: { jobId: 'j1', status: 'accepted' },
      user: { _id: 'rec1' },
    };

    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.updateApplicationStatusCtrl(req, res, vi.fn());

    expect(Application.findByIdAndUpdate).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalled();
    expect(socket.sendNotification).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
