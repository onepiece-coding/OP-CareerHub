import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

/**
 * Connect to an in-memory MongoDB. Reuses existing connection if present.
 */
export async function connectTestDB() {
  // If already connected, reuse
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // If connected but not to the memory server, disconnect first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    // options if you want
  });
}

/** Drop all collections (call between tests) */
export async function clearTestDB() {
  const { connections } = mongoose;
  if (!connections || connections.length === 0) return;
  const db = mongoose.connection.db;
  if (!db) return;
  const collections = await db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

/** Close mongoose connection and stop in-memory server */
export async function closeTestDB() {
  try {
    await mongoose.disconnect();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // ignore
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}
