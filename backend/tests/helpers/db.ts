import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo: MongoMemoryServer | null = null;

/**
 * Start an in-memory MongoDB and connect mongoose to it.
 * Returns the connection URI.
 */
export async function startTestDB(): Promise<string> {
  if (mongo) return mongo.getUri();

  // If mongoose already connected to something, disconnect first to avoid "openUri on active connection" errors
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  }

  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
  return uri;
}

export async function clearDB(): Promise<void> {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await collections[key].deleteMany({});
  }
}

export async function stopTestDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  }
  if (mongo) {
    try {
      await mongo.stop();
    } finally {
      mongo = null;
    }
  }
}
