import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import dayjs from 'dayjs';

// ---------- Hoist-safe mocks ----------
// Mock the User model
vi.mock('../../src/models/User.js', () => {
  return {
    default: {
      find: vi.fn(),
      findByIdAndUpdate: vi.fn(),
    },
  };
});

// Mock the Job model
vi.mock('../../src/models/Job.js', () => {
  return {
    default: {
      find: vi.fn(),
      aggregate: vi.fn(),
    },
  };
});
// ---------- End mocks ----------

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('adminController (unit)', () => {
  it('getAllInfoCtrl returns aggregated counts for users and jobs', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const Job = (await import('../../src/models/Job.js')).default as any;

    (User.find as any).mockImplementation((q: any) => {
      if (!q || Object.keys(q).length === 0) {
        // all users
        return Promise.resolve([{ _id: 'u1' }, { _id: 'u2' }]);
      }
      if (q.role === 'admin') return Promise.resolve([{ _id: 'a1' }]);
      if (q.role === 'recruiter')
        return Promise.resolve([{ _id: 'r1' }, { _id: 'r2' }]);
      if (q.role === 'user') return Promise.resolve([{ _id: 'app1' }]);
      return Promise.resolve([]);
    });

    (Job.find as any).mockImplementation((q: any) => {
      if (!q || Object.keys(q).length === 0) {
        // all jobs
        return Promise.resolve([{ _id: 'j1' }, { _id: 'j2' }, { _id: 'j3' }]);
      }
      if (q.jobStatus === 'interview') return Promise.resolve([{ _id: 'ji1' }]);
      if (q.jobStatus === 'pending')
        return Promise.resolve([{ _id: 'jp1' }, { _id: 'jp2' }]);
      if (q.jobStatus === 'declined') return Promise.resolve([]);
      return Promise.resolve([]);
    });

    // import controller after mocks
    const mod = await import('../../src/controllers/adminController.js');

    // fake express res and next
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // call controller
    await mod.getAllInfoCtrl({} as any, res as any, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        users: 2,
        admins: 1,
        recruiters: 2,
        applicants: 1,
        jobs: 3,
        interviews: 1,
        pending: 2,
        rejected: 0,
      }),
    );
  });

  it('getMonthlyStatsCtrl returns defaultStats and formatted monthly_stats', async () => {
    const Job = (await import('../../src/models/Job.js')).default as any;

    // First aggregate call returns grouping by jobStatus
    const statusAgg = [
      { _id: 'pending', count: 5 },
      { _id: 'interview', count: 2 },
      { _id: 'declined', count: 1 },
    ];

    // Second aggregate call returns monthly grouped items (simulate two months)
    const now = dayjs();
    // create two months: current and previous
    const thisMonth = {
      _id: { year: now.year(), month: now.month() + 1 },
      count: 3,
    };
    const prevMonth = {
      _id: { year: now.year(), month: now.month() },
      count: 2,
    };
    const monthlyAgg = [thisMonth, prevMonth];

    // aggregate is called twice: first for status, then for monthly.
    (Job.aggregate as any)
      .mockResolvedValueOnce(statusAgg) // first call
      .mockResolvedValueOnce(monthlyAgg); // second call

    const mod = await import('../../src/controllers/adminController.js');

    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await mod.getMonthlyStatsCtrl({} as any, res as any, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);

    // read actual call arg
    const payload = res.json.mock.calls[0][0];
    expect(payload.defaultStats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'pending', value: 5 }),
        expect.objectContaining({ name: 'interview', value: 2 }),
        expect.objectContaining({ name: 'rejected', value: 1 }),
      ]),
    );

    // monthly_stats should be formatted and reversed into chronological order
    expect(Array.isArray(payload.monthly_stats)).toBe(true);
    // should contain two entries (we provided two)
    expect(payload.monthly_stats.length).toBe(2);

    // compute expected formatted dates and counts
    const formattedThis = dayjs()
      .month(thisMonth._id.month - 1)
      .year(thisMonth._id.year)
      .format('MMM YY');
    const formattedPrev = dayjs()
      .month(prevMonth._id.month - 1)
      .year(prevMonth._id.year)
      .format('MMM YY');
    expect(payload.monthly_stats[0]).toEqual({
      date: formattedPrev,
      count: prevMonth.count,
    });
    expect(payload.monthly_stats[1]).toEqual({
      date: formattedThis,
      count: thisMonth.count,
    });
  });

  it('updateUserRoleCtrl throws on invalid id', async () => {
    const mod = await import('../../src/controllers/adminController.js');

    const req: any = { body: { id: 'not-a-valid-id', role: 'recruiter' } };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    await mod.updateUserRoleCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.message)).toMatch(/Invalid user id format/i);
  });

  it('updateUserRoleCtrl updates role and returns success on valid id', async () => {
    const User = (await import('../../src/models/User.js')).default as any;

    // prepare a valid ObjectId
    const validId = new mongoose.Types.ObjectId().toString();

    // make findByIdAndUpdate resolve to an object (not used by controller further)
    (User.findByIdAndUpdate as any).mockResolvedValueOnce({
      _id: validId,
      role: 'recruiter',
    });

    const mod = await import('../../src/controllers/adminController.js');

    const req: any = { body: { id: validId, role: 'recruiter' } };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await mod.updateUserRoleCtrl(req, res, vi.fn());

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      { _id: validId },
      { $set: { role: 'recruiter' } },
      { new: true },
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: true,
        message: 'Role updated successfully',
      }),
    );
  });
});
