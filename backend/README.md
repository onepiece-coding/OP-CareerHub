# op-careerhub-backend

Backend for the **op-careerhub** job-search application — Node.js + TypeScript + Express + MongoDB.

---

## Table of contents

- [Features](#features)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Linting & formatting](#linting--formatting)
- [Socket.IO notes (auth + cookies)](#socketio-notes-auth--cookies)
- [Security recommendations](#security-recommendations)
- [Deployment hints](#deployment-hints)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Express + TypeScript backend
- MongoDB via Mongoose
- Auth with short-lived access tokens + rotating refresh tokens (HTTP-only cookies)
- File uploads handled with multer and Cloudinary helpers
- Real-time notifications with Socket.IO
- Validation with Zod
- Rate limiting and security headers (helmet, hpp)
- Basic email sending (nodemailer)

---

## Requirements

- Node.js >= 18 (recommended)
- npm (or yarn / pnpm)
- MongoDB instance (local or remote)
- Optional: Cloudinary account (if using image/upload features)
- Recommended dev deps: Vitest for tests (see [Testing](#testing))

---

## Quick start

1. Clone repo:

   ```bash
   git clone <repo-url>
   cd op-careerhub-backend
   ```

2. Install:

   ```bash
   npm install
   # if you hit peer-dep errors with npm 7+, use:
   # npm install --legacy-peer-deps
   ```

3. Create a .env file (see example below).

4. Run dev server:
   ```bash
   npm run dev
   ```

The server defaults to PORT=8000 (unless overridden in .env).

---

## Environment variables

Create a .env file at the project root. Example (do not commit real secrets):

NODE_ENV=development
PORT=8000

MONGO_URI=mongodb://localhost/careerHubDB

CLIENT_DOMAIN=http://localhost:5173
COOKIE_SECRET=<very-long-random-secret>
JWT_SECRET=<jwt-secret-min-32-chars>
REFRESH_TOKEN_SECRET=<different-refresh-secret-min-32-chars>

ACCESS_TOKEN_EXPIRES_IN_SECONDS=900
REFRESH_TOKEN_EXPIRES_IN_SECONDS=604800

COOKIE_SECURE=false # set to true in production (only send over HTTPS)

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

APP_EMAIL_ADDRESS=you@example.com
APP_EMAIL_PASSWORD=<email-password-or-app-password>

Notes

COOKIE_SECURE should be true in production (HTTPS). Set to false for local development.

Keep JWT_SECRET and REFRESH_TOKEN_SECRET different and at least 32 characters.

---

## Scripts

{
"scripts": {
"dev": "cross-env NODE_ENV=development tsx watch src/server.ts",
"build": "tsc -p tsconfig.build.json",
"start": "node --enable-source-maps dist/server.js",
"lint": "eslint \"src/**/\*.{ts,js}\" --fix",
"format": "prettier --write \"src/**/\*.{ts,js,json,md}\"",
"test": "vitest",
"test:watch": "vitest --watch",
"test:coverage": "vitest --coverage"
}
}
