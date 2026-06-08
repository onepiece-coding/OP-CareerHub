# CareerHub

CareerHub is a **full-stack job management platform** that allows users
to apply for jobs, recruiters to manage listings, and administrators to
oversee the system.

The project includes:

- **Backend:** Node.js + Express + TypeScript + MongoDB
- **Frontend:** React + TypeScript + Redux Toolkit + React Router + Vite
- **Authentication:** JWT with access & refresh tokens
- **Real-time notifications:** Socket.IO
- **Email services:** Brevo
- **File storage:** Cloudinary
- **Testing:** Vitest

---

# Table of Contents

- Features
- Architecture
- Backend Stack
- Frontend Stack
- Project Structure
- Test Credentials
- Contributors
- License

---

# Features

## Authentication

- User registration
- Email verification
- Login with JWT
- Refresh token rotation
- Logout with cookie clearing
- Password reset via email

## User Features

- Update profile
- Upload profile photo
- Upload resume (PDF)
- Apply for jobs
- Receive notifications

## Recruiter Features

- Create job listings
- Update job listings
- Manage applicants

## Admin Features

- View system statistics
- Manage users
- Update user roles
- Delete users

## Notifications

- Real-time notifications using **Socket.IO**

## File Management

- Profile photos uploaded to **Cloudinary**
- Resumes uploaded as **PDF**

---

# Architecture

Client (Frontend) \| REST API + WebSockets \| Node.js / Express Server
\| MongoDB (Mongoose ODM) \| External Services - Brevo (Email) -
Cloudinary (File Storage)

---

# Backend Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Zod (validation)
- JWT
- Socket.IO
- Cloudinary
- Brevo API
- Vitest (unit testing)

---

# Frontend Stack

- React
- TypeScript
- Redux Toolkit
- React Router V6
- Vite
- CSS Modules
- Custom useForm hook
- Custom validation library
- Custom toast system

---

# Test credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@careerhub.com | Admin@1234 |
| Recruiter | recruiter@careerhub.com | Recruiter@1234 |
| User | user@careerhub.com | User@1234 |

---

# Contributors

Backend Developer: Moahamed Bouderya

Frontend Developer: Lahcen Alhiane
