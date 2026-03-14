import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import http from 'http';

beforeEach(async () => {
  const mongoose = await import('mongoose');
  const collections = mongoose.connection.collections;
  for (const k of Object.keys(collections)) {
    // @ts-ignore
    await collections[k].deleteMany({});
  }
  vi.resetAllMocks();
});

afterEach(async () => {
  // nothing special here; each test will close server/client
});

describe('Integration — Socket.io (optional)', () => {
  it('connects with valid JWT and receives new_notification emitted to user room', async () => {
    const app = (await import('../../src/app.js')).default;
    const { initSocket } = await import('../../src/services/socketService.js');
    const factories = await import('../helpers/factories.js');
    const { io: Client } = await import('socket.io-client');
    const { signAccessToken } = await import('../../src/utils/jwt.js');

    const user = await factories.createUser({
      email: `socket-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'sockUser',
      isAccountVerified: true,
    });

    // create http server and attach sockets
    const server = http.createServer(app);
    const io = initSocket(server);

    await new Promise<void>((resolve) => server.listen(0, resolve));
    // get bound port
    // @ts-ignore
    const address = server.address();
    const port = (address && (address as any).port) || 0;
    const url = `http://localhost:${port}`;

    // sign access token for user
    const payload = { id: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);

    // connect client with handshake auth token
    const client = Client(url, {
      auth: { token: accessToken },
      reconnection: false,
    });

    // await connect
    await new Promise<void>((resolve, reject) => {
      client.on('connect', () => resolve());
      client.on('connect_error', (err: any) => reject(err));
      // timeout safety
      setTimeout(() => reject(new Error('socket connect timeout')), 3000);
    });

    // listen for new_notification
    const received = new Promise<any>((resolve, reject) => {
      client.on('new_notification', (payload: any) => {
        resolve(payload);
      });
      setTimeout(() => reject(new Error('no notification received')), 3000);
    });

    // emit from server to user's room
    const testPayload = { hello: 'world' };
    io.to(`user_${user._id.toString()}`).emit('new_notification', testPayload);

    const got = await received;
    expect(got).toEqual(testPayload);

    client.close();
    await new Promise<void>((res) => server.close(() => res()));
  });

  it('rejects connection without token', async () => {
    const app = (await import('../../src/app.js')).default;
    const { initSocket } = await import('../../src/services/socketService.js');
    const { io: Client } = await import('socket.io-client');

    const server = http.createServer(app);
    initSocket(server);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    // @ts-ignore
    const port = (server.address() as any).port;
    const url = `http://localhost:${port}`;

    const client = Client(url, { reconnection: false });
    // expect connect_error
    await new Promise<void>((resolve, reject) => {
      client.on('connect', () => reject(new Error('should not connect')));
      client.on('connect_error', () => resolve());
      setTimeout(() => reject(new Error('no connect_error')), 3000);
    });

    client.close();
    await new Promise<void>((res) => server.close(() => res()));
  });
});
