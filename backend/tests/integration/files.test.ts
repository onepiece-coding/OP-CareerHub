import { describe, it, expect, beforeEach, vi } from 'vitest';

// mock cloudinary before any dynamic imports
vi.mock('../../src/utils/cloudinary.js', () => ({
  uploadImageBuffer: vi.fn(),
  uploadPDFBuffer: vi.fn(),
  removeImage: vi.fn(),
  removePDF: vi.fn(),
  removeMultipleImages: vi.fn(),
  removeMultiplePDFs: vi.fn(),
}));

beforeEach(async () => {
  const mongoose = await import('mongoose');
  const collections = mongoose.connection.collections;
  for (const k of Object.keys(collections)) {
    // @ts-ignore
    await collections[k].deleteMany({});
  }
  vi.resetAllMocks();
});

describe('Integration — Files (resume & profile photo)', () => {
  it('Resume upload updates user resume and removes old resume if existed', async () => {
    const cloud = await import('../../src/utils/cloudinary.js');
    const { getAgent } = await import('../helpers/server.js');
    const factories = await import('../helpers/factories.js');
    const UserModel = (await import('../../src/models/User.js')).default;

    (cloud.uploadPDFBuffer as any).mockResolvedValueOnce({
      secure_url: 'https://cdn.test/new-resume.pdf',
      public_id: 'new-resume-id',
    });
    (cloud.removePDF as any).mockResolvedValueOnce({ result: 'ok' });

    const user = await factories.createUser({
      email: `resume-old-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'resumeOld',
      isAccountVerified: true,
    });

    // give user an existing resume to be removed
    await UserModel.findByIdAndUpdate(user._id, {
      resume: { url: 'https://cdn.test/old.pdf', publicId: 'old-resume-id' },
    });

    const agent = getAgent();
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'Password1!' })
      .expect(200);
    const cookies = login.headers['set-cookie'];
    expect(cookies && cookies.length).toBeGreaterThan(0);

    const buffer = Buffer.from('%PDF-1.4 resume test');
    await agent
      .post('/api/v1/users/profile/resume-upload')
      .set('Cookie', cookies)
      // attach under field name expected by singlePDF('pdf')
      .attach('pdf', buffer, 'resume.pdf')
      .expect(200);

    const updated = await UserModel.findById(user._id).lean().exec();
    expect(updated).toBeTruthy();
    expect((updated!.resume as any).url).toBe(
      'https://cdn.test/new-resume.pdf',
    );
    expect((updated!.resume as any).publicId).toBe('new-resume-id');

    expect(cloud.uploadPDFBuffer).toHaveBeenCalled();
    expect(cloud.removePDF).toHaveBeenCalledWith('old-resume-id');
  }, 20000);

  it("Resume upload when no old resume shouldn't call removePDF and sets new resume", async () => {
    const cloud = await import('../../src/utils/cloudinary.js');
    const { getAgent } = await import('../helpers/server.js');
    const factories = await import('../helpers/factories.js');
    const UserModel = (await import('../../src/models/User.js')).default;

    (cloud.uploadPDFBuffer as any).mockResolvedValueOnce({
      secure_url: 'https://cdn.test/new2-resume.pdf',
      public_id: 'new2-resume-id',
    });
    (cloud.removePDF as any).mockClear();

    const user = await factories.createUser({
      email: `resume-none-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'resumeNone',
      isAccountVerified: true,
    });

    const agent = getAgent();
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'Password1!' })
      .expect(200);
    const cookies = login.headers['set-cookie'];

    const buffer = Buffer.from('%PDF-1.4 resume test 2');
    await agent
      .post('/api/v1/users/profile/resume-upload')
      .set('Cookie', cookies)
      .attach('pdf', buffer, 'resume.pdf')
      .expect(200);

    const updated = await UserModel.findById(user._id).lean().exec();
    expect((updated!.resume as any).url).toBe(
      'https://cdn.test/new2-resume.pdf',
    );
    expect((updated!.resume as any).publicId).toBe('new2-resume-id');

    expect(cloud.uploadPDFBuffer).toHaveBeenCalled();
    expect(cloud.removePDF).not.toHaveBeenCalled();
  });

  it('Profile photo upload updates user and removes old photo if existed', async () => {
    const cloud = await import('../../src/utils/cloudinary.js');
    const { getAgent } = await import('../helpers/server.js');
    const factories = await import('../helpers/factories.js');
    const UserModel = (await import('../../src/models/User.js')).default;

    (cloud.uploadImageBuffer as any).mockResolvedValueOnce({
      secure_url: 'https://cdn.test/new-photo.png',
      public_id: 'new-photo-id',
    });
    (cloud.removeImage as any).mockResolvedValueOnce({ result: 'ok' });

    const user = await factories.createUser({
      email: `photo-old-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'photoOld',
      isAccountVerified: true,
    });

    await UserModel.findByIdAndUpdate(user._id, {
      profilePhoto: {
        url: 'https://cdn.test/old.png',
        publicId: 'old-photo-id',
      },
    });

    const agent = getAgent();
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'Password1!' })
      .expect(200);
    const cookies = login.headers['set-cookie'];

    const imgBuffer = Buffer.from('\x89PNG\r\n\x1a\n');
    await agent
      .post('/api/v1/users/profile/profile-photo-upload')
      .set('Cookie', cookies)
      // attach under field name expected by singleImage('image')
      .attach('image', imgBuffer, 'photo.png')
      .expect(200);

    const updated = await UserModel.findById(user._id).lean().exec();
    expect((updated!.profilePhoto as any).url).toBe(
      'https://cdn.test/new-photo.png',
    );
    expect((updated!.profilePhoto as any).publicId).toBe('new-photo-id');

    expect(cloud.uploadImageBuffer).toHaveBeenCalled();
    expect(cloud.removeImage).toHaveBeenCalledWith('old-photo-id');
  });

  it("Profile photo upload when no old photo shouldn't call removeImage and sets new photo", async () => {
    const cloud = await import('../../src/utils/cloudinary.js');
    const { getAgent } = await import('../helpers/server.js');
    const factories = await import('../helpers/factories.js');
    const UserModel = (await import('../../src/models/User.js')).default;

    (cloud.uploadImageBuffer as any).mockResolvedValueOnce({
      secure_url: 'https://cdn.test/new-photo2.png',
      public_id: 'new-photo2-id',
    });
    (cloud.removeImage as any).mockClear();

    const user = await factories.createUser({
      email: `photo-none-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'photoNone',
      isAccountVerified: true,
    });

    const agent = getAgent();
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'Password1!' })
      .expect(200);
    const cookies = login.headers['set-cookie'];

    const imgBuffer = Buffer.from('\x89PNG\r\n\x1a\n');
    await agent
      .post('/api/v1/users/profile/profile-photo-upload')
      .set('Cookie', cookies)
      .attach('image', imgBuffer, 'photo.png')
      .expect(200);

    const updated = await UserModel.findById(user._id).lean().exec();
    expect((updated!.profilePhoto as any).url).toBe(
      'https://cdn.test/new-photo2.png',
    );
    expect((updated!.profilePhoto as any).publicId).toBe('new-photo2-id');

    expect(cloud.uploadImageBuffer).toHaveBeenCalled();
    expect(cloud.removeImage).not.toHaveBeenCalled();
  });
});
