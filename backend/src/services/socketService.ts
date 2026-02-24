import http from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { parse as parseCookie } from 'cookie';
import { env } from '../env.js';
import logger from '../utils/logger.js';

type UserId = string; // map keys we store as strings
type NotificationPayload = unknown; // keep generic

let io: IOServer | null = null;

/**
 * Map of userId -> Set of socketIds
 * Using Set allows multiple tabs/devices per user.
 */
const connectedUsers = new Map<UserId, Set<string>>();

interface JwtPayload {
  id: string;
  role?: string;
}

/**
 * Parse the allowed origins string into an array for socket.io CORS.
 * env.CLIENT_DOMAIN may be a comma-separated list.
 */
function parseAllowedOrigins(envStr?: string): string[] {
  if (!envStr) return ['*'];
  return envStr
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

/**
 * Initialize socket.io server and attach middleware + handlers.
 * Returns the io instance for direct use if needed.
 */
export function initSocket(server: http.Server): IOServer {
  if (io) return io; // singleton

  io = new IOServer(server, {
    cors: {
      origin: parseAllowedOrigins(env.CLIENT_DOMAIN),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  // Auth middleware: try handshake.auth.token, then fallback to parsing cookie header
  io.use((socket: Socket, next) => {
    try {
      // 1) Prefer explicit token sent by client in handshake.auth
      let token = socket.handshake.auth?.token as string | undefined;

      // 2) Fallback: parse cookies from the handshake headers (httpOnly cookie case)
      if (!token && socket.handshake.headers?.cookie) {
        try {
          const cookies = parseCookie(socket.handshake.headers.cookie);
          token = cookies['access_token'];
        } catch (err) {
          // cookie parsing failed; we'll treat as no token
          logger.debug('Failed to parse cookies on socket handshake', err);
          token = undefined;
        }
      }

      if (!token) {
        return next(new Error('Authentication error: token missing'));
      }

      const secret = env.JWT_SECRET;
      if (!secret) {
        return next(new Error('Authentication error: server misconfiguration'));
      }

      // verify token
      const decoded = jwt.verify(token, secret) as JwtPayload;
      if (!decoded || !decoded.id) {
        return next(new Error('Authentication error: invalid token payload'));
      }

      // Put userId in socket.data for downstream usage
      socket.data.userId = String(decoded.id);
      return next();
    } catch (err) {
      logger.warn('Socket auth failed', err);
      return next(new Error('Authentication error'));
    }
  });

  // Connection handler: populate connectedUsers map, join per-user room, handle disconnects
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string | undefined;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    logger.info(`Socket connected: user=${userId} socketId=${socket.id}`);

    // add socket.id to the user's set
    const set = connectedUsers.get(userId) ?? new Set<string>();
    set.add(socket.id);
    connectedUsers.set(userId, set);

    // join a room per-user for simpler emission
    socket.join(`user_${userId}`);

    socket.on('disconnect', (reason: string) => {
      logger.info(
        `Socket disconnected: user=${userId} socketId=${socket.id} reason=${reason}`,
      );
      const set = connectedUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) connectedUsers.delete(userId);
        else connectedUsers.set(userId, set);
      }
    });
  });

  return io;
}

/** Get the io instance (throws if initSocket wasn't called) */
export function getIO(): IOServer {
  if (!io)
    throw new Error(
      'Socket.io not initialized. Call initSocket(server) first.',
    );
  return io;
}

/** Get socket ids for a user (array copy) */
export function getSocketIdsForUser(userId: string | number): string[] {
  const set = connectedUsers.get(String(userId));
  return set ? Array.from(set) : [];
}

/**
 * Send notification to a user (emits to all connected sockets for that user).
 * Generic payload type T.
 */
export function sendNotification<T = NotificationPayload>(
  userId: string | number,
  payload: T,
): void {
  if (!io) {
    logger.warn('sendNotification called before socket.io initialization');
    return;
  }
  const roomName = `user_${String(userId)}`;
  io.to(roomName).emit('new_notification', payload);
}

/** Optional helper for broadcasting to everyone (careful) */
export function broadcast<T = unknown>(event: string, payload: T): void {
  if (!io) return;
  io.emit(event, payload);
}

/** Allows other modules to inspect connected users (read-only view) */
export function listConnectedUsers(): Record<string, number> {
  const out: Record<string, number> = {};
  connectedUsers.forEach((sockets, uid) => {
    out[uid] = sockets.size;
  });
  return out;
}
