import { beforeAll, afterAll, afterEach } from 'vitest';
import { startTestDB, clearDB, stopTestDB } from './helpers/db.js';

beforeAll(async () => {
  await startTestDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await stopTestDB();
});
