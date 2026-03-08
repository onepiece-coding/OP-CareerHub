import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import http from 'http';

// --------- Hoist-safe mocks ---------
// Mock env so the module sees a valid JWT secret and client domain
vi.mock('../../src/env.js', () => {
  return {
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test_jwt_secret_which_is_long_enough_123456',
      CLIENT_DOMAIN: 'http://localhost:3000,https://example.com',
    },
  };
});

// Mock jsonwebtoken - to control verify() behavior
vi.mock('jsonwebtoken', () => {
  return {
    default: {
      verify: (...args: any[]) => {
        const token = args[0] as string;
        if (token === 'good-token') {
          return { id: 'user-1' } as any;
        }
        throw new Error('invalid token');
      },
    },
  };
});

// Mock logger to spy on warn/info calls
vi.mock('../../src/utils/logger.js', () => {
  return {
    default: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  };
});

// Mock socket.io Server.
vi.mock('socket.io', () => {
  const instances: any[] = [];

  class FakeServer {
    opts: any;
    middlewares: Function[] = [];
    connectionCb: Function | null = null;
    lastEmits: Array<{ room: string; event: string; payload: any }> = [];
    lastBroadcasts: Array<{ event: string; payload: any }> = [];
    constructor(_server: any, opts: any) {
      this.opts = opts;
      instances.push(this);
    }

    // socket.io API surface
    use(fn: Function) {
      this.middlewares.push(fn);
    }

    on(event: string, cb: Function) {
      if (event === 'connection') this.connectionCb = cb;
    }

    to(roomName: string) {
      const self = this;
      return {
        emit(event: string, payload: any) {
          self.lastEmits.push({ room: roomName, event, payload });
        },
      };
    }

    emit(event: string, payload: any) {
      this.lastBroadcasts.push({ event, payload });
    }

    // testing helper: simulate a connection by invoking the registered connection callback
    _simulateConnection(socket: any) {
      if (!this.connectionCb) throw new Error('no connection cb registered');
      this.connectionCb(socket);
    }
  }

  return { Server: FakeServer, __instances: instances };
});
// --------- End mocks ---------

beforeEach(() => {
  // reset module state
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('socketService (unit)', () => {
  it('initSocket creates io with parsed allowed origins and is idempotent', async () => {
    const { initSocket: init } =
      await import('../../src/services/socketService.js');
    const { __instances } = (await import('socket.io')) as any;

    const fakeHttp = {} as unknown as http.Server;
    const io1 = init(fakeHttp);
    expect(__instances.length).toBeGreaterThanOrEqual(1);
    const inst = io1 as any;
    expect(inst.opts).toBeDefined();
    expect(Array.isArray(inst.opts.cors.origin)).toBe(true);

    // calling again returns same instance (singleton)
    const io2 = init(fakeHttp);
    expect(io1).toBe(io2);
  });

  it('middleware authenticates handshake.auth.token and connection registers socket id', async () => {
    const { initSocket: init } =
      await import('../../src/services/socketService.js');

    const fakeHttp = {} as unknown as http.Server;
    const io = init(fakeHttp);
    const inst = io as any;

    // assume the first registered middleware is the auth middleware
    expect(inst.middlewares.length).toBeGreaterThan(0);
    const authMiddleware = inst.middlewares[0];

    const fakeSocket = {
      handshake: { auth: { token: 'good-token' }, headers: {} },
      data: {} as any,
      id: 'socket-1',
      join: vi.fn(),
      on: vi.fn((_ev: string, _cb: any) => {}),
      disconnect: vi.fn(),
    };

    // Capture next(err) rather than throwing
    let capturedErr: unknown = undefined;
    const next = (err?: any) => {
      capturedErr = err;
    };

    // run middleware
    await authMiddleware(fakeSocket, next);

    // middleware should have called next with no error
    expect(capturedErr).toBeUndefined();

    // simulate a connection (this runs the connection handler that updates connectedUsers)
    inst._simulateConnection(fakeSocket);

    // Check the instance returned by initSocket for the socket bookkeeping
    const { getSocketIdsForUser } =
      await import('../../src/services/socketService.js');
    const ids = getSocketIdsForUser('user-1');
    expect(ids).toContain('socket-1');

    const { listConnectedUsers } =
      await import('../../src/services/socketService.js');
    const list = listConnectedUsers();
    expect(list['user-1']).toBe(1);
  });

  it('middleware tries cookies fallback if auth token missing and fails gracefully when parsing cookie', async () => {
    const { initSocket: init } =
      await import('../../src/services/socketService.js');

    const fakeHttp = {} as unknown as http.Server;
    const io = init(fakeHttp);
    const inst = io as any;
    const authMiddleware = inst.middlewares[0];

    const fakeSocket = {
      handshake: { auth: {}, headers: { cookie: 'not a cookie header' } },
      data: {} as any,
      id: 'socket-2',
      join: vi.fn(),
      on: vi.fn(),
      disconnect: vi.fn(),
    };

    let gotErr: any = null;
    const next = (err?: any) => {
      gotErr = err;
    };

    await authMiddleware(fakeSocket, next);
    expect(gotErr).toBeInstanceOf(Error);
    expect(String(gotErr.message)).toContain('Authentication error');
  });

  it('middleware returns server misconfiguration when JWT_SECRET missing', async () => {
    // ensure fresh modules
    vi.resetModules();

    // mutate env export before importing socketService
    const envMod = (await import('../../src/env.js')) as any;
    envMod.env.JWT_SECRET = undefined;

    const { initSocket } = await import('../../src/services/socketService.js');
    const io = initSocket({} as http.Server);
    const auth = (io as any).middlewares[0];

    let captured: any = undefined;
    const fakeSocket = {
      handshake: { auth: { token: 'good-token' }, headers: {} },
      data: {},
      id: 's-misconf',
      join: vi.fn(),
      on: vi.fn(),
      disconnect: vi.fn(),
    };

    await auth(fakeSocket, (err?: any) => {
      captured = err;
    });

    expect(captured).toBeInstanceOf(Error);
    expect(String(captured.message)).toContain('server misconfiguration');
  });

  it('middleware fails when jwt.verify returns an object without id (invalid token payload)', async () => {
    const jwt = (await import('jsonwebtoken')) as any;
    jwt.default.verify = (..._args: any[]) => ({}) as any;

    // ensure env has a secret (avoid server misconfiguration)
    const envMod = (await import('../../src/env.js')) as any;
    envMod.env.JWT_SECRET = 'test_jwt_secret_which_is_long_enough_123456';

    const { initSocket } = await import('../../src/services/socketService.js');

    const io = initSocket({} as http.Server);
    const auth = (io as any).middlewares[0];

    let captured: any;
    const fakeSocket = {
      handshake: { auth: { token: 'any-token' }, headers: {} },
      data: {},
      id: 's-invalid',
      join: vi.fn(),
      on: vi.fn(),
      disconnect: vi.fn(),
    };

    await auth(fakeSocket, (err?: any) => {
      captured = err;
    });

    expect(captured).toBeInstanceOf(Error);
    expect(String(captured.message)).toContain('invalid token payload');
  });

  it('middleware logs warn and returns Authentication error when jwt.verify throws', async () => {
    // override jwt.verify to throw
    const jwt = (await import('jsonwebtoken')) as any;
    jwt.default.verify = (..._args: any[]) => {
      throw new Error('boom');
    };

    // ensure env present so middleware executes and hit the catch block
    const envMod = (await import('../../src/env.js')) as any;
    envMod.env.JWT_SECRET = 'test_jwt_secret_which_is_long_enough_123456';

    // get logger mock to assert warn called
    const logger = (await import('../../src/utils/logger.js')).default;

    const { initSocket } = await import('../../src/services/socketService.js');

    const io = initSocket({} as http.Server);
    const auth = (io as any).middlewares[0];

    let captured: any;
    const fakeSocket = {
      handshake: { auth: { token: 'any' }, headers: {} },
      data: {},
      id: 's-throw',
      join: vi.fn(),
      on: vi.fn(),
      disconnect: vi.fn(),
    };

    await auth(fakeSocket, (err?: any) => {
      captured = err;
    });

    expect(logger.warn).toHaveBeenCalled();
    expect(captured).toBeInstanceOf(Error);
  });

  it('cookie fallback succeeds when access_token present in cookie and disconnect cleans up', async () => {
    // ensure jwt.verify returns id again
    const jwt = (await import('jsonwebtoken')) as any;
    jwt.default.verify = (...args: any[]) => {
      const token = args[0] as string;
      if (token === 'good-token') return { id: 'user-1' } as any;
      throw new Error('invalid');
    };

    // re-import service fresh
    vi.resetModules();

    // ensure env has a secret (socketService will read it on import)
    const envMod = (await import('../../src/env.js')) as any;
    envMod.env.JWT_SECRET = 'test_jwt_secret_which_is_long_enough_123456';

    const { initSocket } = await import('../../src/services/socketService.js');
    const io = initSocket({} as http.Server);
    const inst = io as any;
    const auth = inst.middlewares[0];

    // prepare a socket that captures the disconnect callback when on('disconnect', cb) is called
    let disconnectCb: any = null;
    const fakeSocket: any = {
      handshake: { auth: {}, headers: { cookie: 'access_token=good-token' } },
      data: {},
      id: 'sock-dc',
      join: vi.fn(),
      on: (ev: string, cb: any) => {
        if (ev === 'disconnect') disconnectCb = cb;
        // noop for other events
      },
      disconnect: vi.fn(),
    };

    let capturedErr: any = undefined;
    await auth(fakeSocket, (err?: any) => {
      capturedErr = err;
    });

    expect(capturedErr).toBeUndefined();

    // simulate connection (this will add the socket id and register disconnect)
    inst._simulateConnection(fakeSocket);

    const { getSocketIdsForUser, listConnectedUsers } =
      await import('../../src/services/socketService.js');

    expect(getSocketIdsForUser('user-1')).toContain('sock-dc');
    expect(listConnectedUsers()['user-1']).toBe(1);

    // call the recorded disconnect callback and verify cleanup
    expect(typeof disconnectCb).toBe('function');
    disconnectCb('client disconnect');

    expect(getSocketIdsForUser('user-1')).not.toContain('sock-dc');
    // after disconnect there may be no entry for user-1
    expect(listConnectedUsers()['user-1'] || 0).toBe(0);
  });

  it('sendNotification warns when io not initialized and emits when initialized', async () => {
    // import sendNotification from a fresh module (io initially null)
    const mod1 = await import('../../src/services/socketService.js');
    const snBefore = mod1.sendNotification;
    const log = (await import('../../src/utils/logger.js')).default;

    // calling before init should warn and do nothing
    snBefore('someuser', { a: 1 });
    expect(log.warn).toHaveBeenCalled();

    // reset and init properly and inspect the returned io instance (guaranteed same object)
    vi.resetModules();
    const svc = await import('../../src/services/socketService.js');
    const { initSocket: init2, sendNotification: sn } = svc;
    const fakeHttp = {} as unknown as http.Server;
    const io = init2(fakeHttp);
    const inst = io as any;

    // now call sendNotification and assert the exact instance we have recorded the emit on
    sn('user-1', { hello: 'world' });

    // inspect the instance returned by initSocket (not __instances), it should hold lastEmits
    expect(inst.lastEmits.length).toBeGreaterThan(0);
    expect(inst.lastEmits[0].room).toBe('user_user-1');
    expect(inst.lastEmits[0].event).toBe('new_notification');
    expect(inst.lastEmits[0].payload).toEqual({ hello: 'world' });
  });

  it('broadcast emits to server when initialized', async () => {
    vi.resetModules();
    const svc = await import('../../src/services/socketService.js');
    const { initSocket: init3, broadcast: bc } = svc;
    const fakeHttp = {} as unknown as http.Server;
    const io = init3(fakeHttp);
    const inst = io as any;

    bc('global_event', { foo: 'bar' });
    expect(inst.lastBroadcasts.length).toBeGreaterThan(0);
    expect(inst.lastBroadcasts[0].event).toBe('global_event');
    expect(inst.lastBroadcasts[0].payload).toEqual({ foo: 'bar' });
  });

  it('getIO throws when socket not initialized', async () => {
    vi.resetModules();
    const { getIO: localGetIO } =
      await import('../../src/services/socketService.js');
    expect(() => {
      localGetIO();
    }).toThrow();
  });
});
