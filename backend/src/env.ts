import 'dotenv/config';
import { z } from 'zod';
import logger from './utils/logger.js';

const base = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(8000),

  // General secrets
  COOKIE_SECRET: z.string().optional(),
  CLIENT_DOMAIN: z.string().optional(),
});

// Vars required for runtime services
const runtime = z.object({
  MONGO_URI: z.string().optional(), // required later unless test
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 15), // 15 minutes
  REFRESH_TOKEN_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60 * 24 * 7), // 7 days
  COOKIE_SECURE: z.coerce.boolean().optional(),
  // Cloudinary credentials (required when not testing if you use Cloudinary)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  // Email
  APP_EMAIL_ADDRESS: z.email().optional(),
  FROM_EMAIL: z.email().optional(),
  BREVO_API_KEY: z.string().optional(),
  EMAIL_TIMEOUT_MS: z.coerce.number().optional(),
  APP_NAME: z.string().optional(),
});

const envSchema = base.extend(runtime.shape).refine(
  (data) => {
    // If not running tests, require real-service credentials/URIs
    if (data.NODE_ENV === 'test') return true;

    const hasMongo =
      typeof data.MONGO_URI === 'string' && data.MONGO_URI.length > 0;
    const hasJwt =
      typeof data.JWT_SECRET === 'string' && data.JWT_SECRET.length >= 32;

    // Require the three cloudinary vars
    const hasCloudinary =
      typeof data.CLOUDINARY_CLOUD_NAME === 'string' &&
      data.CLOUDINARY_CLOUD_NAME.length > 0 &&
      typeof data.CLOUDINARY_API_KEY === 'string' &&
      data.CLOUDINARY_API_KEY.length > 0 &&
      typeof data.CLOUDINARY_API_SECRET === 'string' &&
      data.CLOUDINARY_API_SECRET.length > 0;

    // Email
    const hasEmailCreds =
      typeof data.FROM_EMAIL === 'string' &&
      data.FROM_EMAIL.length > 0 &&
      typeof data.BREVO_API_KEY === 'string' &&
      data.BREVO_API_KEY.length > 0;

    return hasMongo && hasJwt && hasCloudinary && hasEmailCreds;
  },
  {
    message:
      'Missing required environment variables for non-test environment. Ensure MONGO_URI, JWT_SECRET (>=32 chars), Cloudinary credentials, and email credentials are set.',
  },
);

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error(
    '❌ Invalid environment variables:\n',
    z.prettifyError(parsed.error),
  );
  // logger.error("❌ Invalid environment variables:\n", parsed.error.format()); use this if the prev crashes
  logger.error(
    '❯ Error details (tree):\n',
    JSON.stringify(z.treeifyError(parsed.error), null, 2),
  );
  throw new Error('Invalid environment variables — see log for details');
}

export const env = parsed.data as z.infer<typeof envSchema>;
export type Env = typeof env;
