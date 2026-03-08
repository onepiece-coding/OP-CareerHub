import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ----------------- Hoist-safe mocks -----------------
vi.mock('../../src/utils/cloudinary.js', () => {
  return {
    uploadImageBuffer: vi.fn(),
    uploadPDFBuffer: vi.fn(),
    removeImage: vi.fn(),
    removeMultipleImages: vi.fn(),
    removePDF: vi.fn(),
    removeMultiplePDFs: vi.fn(),
  };
});

vi.mock('../../src/models/User.js', () => {
  return {
    default: {
      countDocuments: vi.fn(),
      find: vi.fn(),
      findById: vi.fn(),
      findByIdAndDelete: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
});

vi.mock('../../src/models/Job.js', () => {
  return {
    default: {
      find: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
});

vi.mock('../../src/models/Application.js', () => {
  return {
    default: {
      deleteMany: vi.fn(),
      countDocuments: vi.fn(),
    },
  };
});

vi.mock('../../src/models/Notification.js', () => {
  return {
    default: {
      deleteMany: vi.fn(),
      countDocuments: vi.fn(),
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

describe('user controllers (unit)', () => {
  it('getAllUsersCtrl returns paginated users and totalPages', async () => {
    const User = (await import('../../src/models/User.js')).default as any;

    // Make countDocuments resolve to 25
    User.countDocuments.mockResolvedValueOnce(25);

    // Prepare a fake users array
    const fakeUsers = Array.from({ length: 10 }, (_, i) => ({
      _id: `u${i}`,
      username: `user${i}`,
    }));

    // Mock chainable find().skip().limit().sort().select() -> returns Promise<fakeUsers>
    (User.find as any).mockImplementation(() => {
      return {
        skip: (_: number) => ({
          limit: (_: number) => ({
            sort: (_: any) => ({
              select: (_: string) => Promise.resolve(fakeUsers),
            }),
          }),
        }),
      };
    });

    const mod = await import('../../src/controllers/userController.js');

    // fake req with default query (pageNumber omitted)
    const req: any = { query: {} };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await mod.getAllUsersCtrl(req, res, vi.fn());

    expect(User.countDocuments).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        users: fakeUsers,
        totalPages: Math.ceil(25 / 10),
      }),
    );
  });

  it('getSingleUserCtrl returns 200 when found and calls next when not found', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const mod = await import('../../src/controllers/userController.js');

    // Case 1: found
    const userObj = { _id: 'abc', username: 'bob' };
    (User.findById as any).mockImplementationOnce(() => ({
      select: () => Promise.resolve(userObj),
    }));

    const req1: any = { params: { id: 'abc' } };
    const res1: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next1 = vi.fn();

    await mod.getSingleUserCtrl(req1, res1, next1);

    expect(res1.status).toHaveBeenCalledWith(200);
    expect(res1.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: userObj }),
    );

    // Case 2: not found -> should call next with 404
    (User.findById as any).mockImplementationOnce(() => ({
      select: () => Promise.resolve(null),
    }));
    const req2: any = { params: { id: 'nope' } };
    const res2: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next2 = vi.fn();

    await mod.getSingleUserCtrl(req2, res2, next2);

    expect(next2).toHaveBeenCalled();
    const err = next2.mock.calls[0][0];
    expect(String(err.message)).toMatch(/User not found|not found/i);
  });

  it('updateUserCtrl handles unauthorized, nothing to update, and success', async () => {
    const mod = await import('../../src/controllers/userController.js');

    // unauthorized: req.user.id !== params.id
    const req0: any = { user: { id: 'a' }, params: { id: 'b' }, body: {} };
    const res0: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next0 = vi.fn();
    await mod.updateUserCtrl(req0, res0, next0);
    expect(next0).toHaveBeenCalled();
    expect(String(next0.mock.calls[0][0].message)).toMatch(/Unauthorized/i);

    // nothing to update: same id but no updatable fields
    const userMock: any = { id: 'u1', save: vi.fn() };
    const req1: any = { user: userMock, params: { id: 'u1' }, body: {} };
    const res1: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next1 = vi.fn();
    await mod.updateUserCtrl(req1, res1, next1);
    expect(next1).toHaveBeenCalled();
    expect(String(next1.mock.calls[0][0].message)).toMatch(
      /Nothing to update/i,
    );

    // success: update username + password and save invoked
    const userSave = vi.fn().mockResolvedValue({});
    const userObj: any = { id: 'u2', save: userSave, password: 'secret' };
    const req2: any = {
      user: userObj,
      params: { id: 'u2' },
      body: { username: 'newname', password: 'newpass' },
    };
    const res2: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await mod.updateUserCtrl(req2, res2, vi.fn());
    expect(userSave).toHaveBeenCalled();
    expect(res2.status).toHaveBeenCalledWith(200);
    expect(res2.json).toHaveBeenCalled();
  });

  it('resumeUploadCtrl: missing file -> next, with file uploads, removes old resume if present and saves', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const cloud = (await import('../../src/utils/cloudinary.js')) as any;

    const mod = await import('../../src/controllers/userController.js');

    // missing file
    const req0: any = { file: undefined, user: { id: 'u1' } };
    const res0: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next0 = vi.fn();
    await mod.resumeUploadCtrl(req0, res0, next0);
    expect(next0).toHaveBeenCalled();
    expect(String(next0.mock.calls[0][0].message)).toMatch(/No file provided/i);

    // with file, user exists and had previous resume -> removePDF called + save
    const uploadRes = {
      secure_url: 'https://cdn/resume.pdf',
      public_id: 'res123',
    };
    cloud.uploadPDFBuffer.mockResolvedValueOnce(uploadRes);
    cloud.removePDF.mockResolvedValueOnce({ result: 'ok' });

    const savedUser = {
      _id: 'u2',
      resume: { publicId: 'oldpid', url: 'old' },
      save: vi.fn().mockResolvedValue({}),
    };
    (User.findById as any).mockResolvedValueOnce(savedUser);

    const req1: any = {
      file: { buffer: Buffer.from('pdf') },
      user: { id: 'u2' },
    };
    const res1: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.resumeUploadCtrl(req1, res1, vi.fn());

    expect(cloud.uploadPDFBuffer).toHaveBeenCalled();
    expect(cloud.removePDF).toHaveBeenCalledWith('oldpid');
    expect(savedUser.save).toHaveBeenCalled();
    expect(res1.status).toHaveBeenCalledWith(200);
    expect(res1.json).toHaveBeenCalledWith(
      expect.objectContaining({
        resume: { url: uploadRes.secure_url, publicId: uploadRes.public_id },
      }),
    );
  });

  it('profilePhotoUploadCtrl: missing file -> next, with file uploads and removes old image', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const cloud = (await import('../../src/utils/cloudinary.js')) as any;
    const mod = await import('../../src/controllers/userController.js');

    // missing file -> error
    const req0: any = { file: undefined, user: { id: 'u1' } };
    const res0: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next0 = vi.fn();
    await mod.profilePhotoUploadCtrl(req0, res0, next0);
    expect(next0).toHaveBeenCalled();
    expect(String(next0.mock.calls[0][0].message)).toMatch(
      /No image provided/i,
    );

    // with file and existing publicId -> call removeImage
    const uploadRes = {
      secure_url: 'https://cdn/img.jpg',
      public_id: 'img123',
    };
    cloud.uploadImageBuffer.mockResolvedValueOnce(uploadRes);
    cloud.removeImage.mockResolvedValueOnce({ result: 'ok' });

    const userRecord: any = {
      _id: 'u3',
      profilePhoto: { publicId: 'oldimg' },
      save: vi.fn().mockResolvedValue({}),
    };
    (User.findById as any).mockResolvedValueOnce(userRecord);

    const req1: any = {
      file: { buffer: Buffer.from('img') },
      user: { id: 'u3' },
    };
    const res1: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.profilePhotoUploadCtrl(req1, res1, vi.fn());

    expect(cloud.uploadImageBuffer).toHaveBeenCalled();
    expect(cloud.removeImage).toHaveBeenCalledWith('oldimg');
    expect(userRecord.save).toHaveBeenCalled();
    expect(res1.status).toHaveBeenCalledWith(200);
    expect(res1.json).toHaveBeenCalledWith(
      expect.objectContaining({
        profilePhoto: {
          url: uploadRes.secure_url,
          publicId: uploadRes.public_id,
        },
      }),
    );
  });

  it('deleteUserCtrl handles recruiter cleanup (jobs, applications, notifications) and deletes user', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const Job = (await import('../../src/models/Job.js')).default as any;
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const Notification = (await import('../../src/models/Notification.js'))
      .default as any;
    const cloud = (await import('../../src/utils/cloudinary.js')) as any;
    const mod = await import('../../src/controllers/userController.js');

    // Setup: recruiter user with both profilePhoto and resume
    const recruiter = {
      _id: 'r1',
      role: 'recruiter',
      profilePhoto: { publicId: 'p1' },
      resume: { publicId: 'res1' },
    };
    (User.findById as any).mockResolvedValueOnce(recruiter);

    // Job.find returns two jobs
    const jobs = [{ _id: 'job1' }, { _id: 'job2' }];
    (Job.find as any).mockResolvedValueOnce(jobs);

    // Application.deleteMany & Job.deleteMany & Notification.deleteMany are mocks
    Application.deleteMany.mockResolvedValue({ deletedCount: 5 });
    Job.deleteMany.mockResolvedValue({ deletedCount: 2 });
    Notification.deleteMany.mockResolvedValue({ deletedCount: 3 });
    (User.findByIdAndDelete as any).mockResolvedValueOnce({ deletedCount: 1 });

    const req: any = { params: { id: 'r1' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.deleteUserCtrl(req, res, vi.fn());

    // removeImage/removePDF should have been called for existing publicIds
    expect(cloud.removeImage).toHaveBeenCalledWith('p1');
    expect(cloud.removePDF).toHaveBeenCalledWith('res1');

    // Applications for recruiter jobs deleted
    expect(Application.deleteMany).toHaveBeenCalled();

    // Jobs deleted
    expect(Job.deleteMany).toHaveBeenCalled();

    // Notifications deleted
    expect(Notification.deleteMany).toHaveBeenCalled();

    // user deleted
    expect(User.findByIdAndDelete).toHaveBeenCalledWith('r1');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: true }),
    );
  });

  it('deleteAllUsersCtrl prevents deleting admin role and deletes non-admins, calling cloudinary removals and returning stats', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const Job = (await import('../../src/models/Job.js')).default as any;
    const Application = (await import('../../src/models/Application.js'))
      .default as any;
    const Notification = (await import('../../src/models/Notification.js'))
      .default as any;
    const cloud = (await import('../../src/utils/cloudinary.js')) as any;
    const mod = await import('../../src/controllers/userController.js');

    // guard: passing role=admin in query should throw
    const reqGuard: any = { query: { role: 'admin' } };
    const resGuard: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const nextGuard = vi.fn();
    await mod.deleteAllUsersCtrl(reqGuard, resGuard, nextGuard);
    expect(nextGuard).toHaveBeenCalled();
    expect(String(nextGuard.mock.calls[0][0].message)).toMatch(
      /Admin users can not be deleted/i,
    );

    // success path: prepare users list (one user, one recruiter)
    const usersList = [
      {
        _id: 'u1',
        role: 'user',
        profilePhoto: { publicId: 'img1' },
        resume: { publicId: 'res1' },
      },
      {
        _id: 'r1',
        role: 'recruiter',
        profilePhoto: { publicId: 'img2' },
        resume: { publicId: 'res2' },
      },
    ];
    (User.find as any).mockResolvedValueOnce(usersList);

    // Notification.countDocuments
    Notification.countDocuments.mockResolvedValueOnce(7);

    // cloudinary removals
    cloud.removeMultipleImages.mockResolvedValueOnce({ result: 'ok' });
    cloud.removeMultiplePDFs.mockResolvedValueOnce({ result: 'ok' });

    // Application.countDocuments for regular users and recruiters
    Application.countDocuments.mockResolvedValueOnce(2);
    // Job.find for recruiters -> return jobs
    const recruiterJobs = [{ _id: 'j1' }, { _id: 'j2' }];
    (Job.find as any).mockResolvedValueOnce(recruiterJobs);
    Application.countDocuments.mockResolvedValueOnce(4);

    // deleteMany operations
    Application.deleteMany.mockResolvedValueOnce({ deletedCount: 6 });
    Application.deleteMany.mockResolvedValueOnce({ deletedCount: 4 });
    Job.deleteMany.mockResolvedValueOnce({ deletedCount: 2 });
    Notification.deleteMany.mockResolvedValueOnce({ deletedCount: 7 });
    User.deleteMany.mockResolvedValueOnce({ deletedCount: 2 });

    const req: any = { query: {} };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.deleteAllUsersCtrl(req, res, vi.fn());

    // cloud removals were called with arrays of publicIds
    expect(cloud.removeMultipleImages).toHaveBeenCalled();
    expect(cloud.removeMultiplePDFs).toHaveBeenCalled();

    // counts were fetched
    expect(Notification.countDocuments).toHaveBeenCalled();

    // response should include stats with counts
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty('stats');
    expect(payload.stats).toHaveProperty('totalUsersDeleted', 2);
    expect(payload.stats).toHaveProperty('resumesDeleted', 2);
    expect(payload.stats).toHaveProperty('notificationsDeleted', 7);
  });
});
