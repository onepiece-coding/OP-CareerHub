import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ----------------- Hoist-safe mock for Notification model -----------------
class MockNotification {
  static find = vi.fn();
  static findOneAndUpdate = vi.fn();
  static deleteOne = vi.fn();
}

vi.mock('../../src/models/Notification.js', () => ({
  default: MockNotification,
}));
// -------------------------------------------------------------------------

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('notification controllers (unit)', () => {
  it('getNotificationsCtrl returns notifications for the user', async () => {
    const Notification = (await import('../../src/models/Notification.js'))
      .default as any;
    const mod = await import('../../src/controllers/notificationController.js');

    const notifs = [
      { _id: 'n1', recipient: 'u1', message: 'one' },
      { _id: 'n2', recipient: 'u1', message: 'two' },
    ];

    // Notification.find(...).sort(...) -> resolves to array
    (Notification.find as any).mockImplementationOnce(() => ({
      sort: (_: any) => Promise.resolve(notifs),
    }));

    const req: any = { user: { _id: 'u1' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.getNotificationsCtrl(req, res, vi.fn());

    expect(Notification.find).toHaveBeenCalledWith({ recipient: 'u1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: notifs }),
    );
  });

  it('markNotificationAsReadCtrl marks notification and returns updated doc', async () => {
    const Notification = (await import('../../src/models/Notification.js'))
      .default as any;
    const mod = await import('../../src/controllers/notificationController.js');

    const updated = { _id: 'n1', recipient: 'u1', read: true };

    (Notification.findOneAndUpdate as any).mockResolvedValueOnce(updated);

    const req: any = { params: { id: 'n1' }, user: { _id: 'u1' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.markNotificationAsReadCtrl(req, res, vi.fn());

    expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'n1', recipient: 'u1' },
      { read: true },
      { returnDocument: 'after' },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: updated }),
    );
  });

  it('markNotificationAsReadCtrl calls next with 404 when underlying call throws', async () => {
    const Notification = (await import('../../src/models/Notification.js'))
      .default as any;
    const mod = await import('../../src/controllers/notificationController.js');

    // simulate DB error -> trigger catch -> controller throws createError(404,...)
    (Notification.findOneAndUpdate as any).mockImplementationOnce(() =>
      Promise.reject(new Error('db')),
    );

    const req: any = { params: { id: 'bad' }, user: { _id: 'u1' } };
    const next = vi.fn();
    const res: any = { status: vi.fn(), json: vi.fn() };

    await mod.markNotificationAsReadCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.message)).toMatch(/Notification not found/i);
  });

  it('deleteNotificationCtrl deletes notification and returns success message', async () => {
    const Notification = (await import('../../src/models/Notification.js'))
      .default as any;
    const mod = await import('../../src/controllers/notificationController.js');

    (Notification.deleteOne as any).mockResolvedValueOnce({ deletedCount: 1 });

    const req: any = { params: { id: 'n1' }, user: { _id: 'u1' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await mod.deleteNotificationCtrl(req, res, vi.fn());

    expect(Notification.deleteOne).toHaveBeenCalledWith({
      _id: 'n1',
      recipient: 'u1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Notification deleted successfully',
      }),
    );
  });

  it('deleteNotificationCtrl throws 404 when notification not found', async () => {
    const Notification = (await import('../../src/models/Notification.js'))
      .default as any;
    const mod = await import('../../src/controllers/notificationController.js');

    // simulate no deletion
    (Notification.deleteOne as any).mockResolvedValueOnce({ deletedCount: 0 });

    const req: any = { params: { id: 'missing' }, user: { _id: 'u1' } };
    const next = vi.fn();
    const res: any = { status: vi.fn(), json: vi.fn() };

    await mod.deleteNotificationCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.message)).toMatch(/Notification not found/i);
  });
});
