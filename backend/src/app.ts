import express, { Application, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './middlewares/error.js';
import { env } from './env.js';
import rootRouter from './routes/index.js';
import path from 'path';

const __dirname = path.resolve(); // backend path

// Initialize app
const app: Application = express();

const trustProxy = process.env.TRUST_PROXY;
if (typeof trustProxy !== 'undefined') {
  // convert common values ("1","true") to useful types for Express
  if (trustProxy === '1') {
    app.set('trust proxy', 1);
  } else if (trustProxy === 'true') {
    app.set('trust proxy', true);
  } else {
    app.set('trust proxy', trustProxy); // allow IPs/list
  }
} else if (env.NODE_ENV === 'production') {
  // sensible default on common PaaS
  app.set('trust proxy', 1);
}

const allowedOrigin = env.CLIENT_DOMAIN || '*';

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': [
          "'self'",
          'data:',
          'blob:',
          'res.cloudinary.com',
          'cdn.pixabay.com',
        ],
        'connect-src': [
          "'self'",
          env.CLIENT_DOMAIN ?? "'self'",
          'res.cloudinary.com',
          'cdn.pixabay.com',
          'ws:',
          'wss:',
        ],
      },
    },
  }),
);
app.use(hpp());

if (process.env.NODE_ENV !== 'production') {
  app.use(
    cors({
      origin: allowedOrigin === '*' ? true : allowedOrigin,
      methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
      credentials: allowedOrigin !== '*',
      exposedHeaders: ['Content-Disposition'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  );
}

app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 500,
  }),
);

// Body parsers and cookie parser
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser(env.COOKIE_SECRET ?? undefined));

// Routes
app.use('/api/v1', rootRouter);

if (env.NODE_ENV === 'production') {
  // Express serve static files (html, css, js, ...)
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*path', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
  });
}

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(
  errorHandler as (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void,
);

export default app;
