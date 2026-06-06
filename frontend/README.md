# CareerHub — Frontend

> A full-featured job portal SPA built with React 19, TypeScript, Redux Toolkit, and CSS Modules. Supports three roles — **Admin**, **Recruiter**, and **Job Seeker** — with a complete authentication flow, role-based dashboards, job listings, and application management.

[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux)](https://redux-toolkit.js.org)
[![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?logo=reactrouter)](https://reactrouter.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)

---

| Repository | Description |
|---|---|
| **This repo** | React SPA — frontend only |
| [CareerHub Backend](https://github.com/onepiece-coding/OP-CareerHub/tree/main/backend) | Express + MongoDB REST API |
| [CareerHub Monorepo](https://github.com/onepiece-coding/OP-CareerHub) | Full-stack — frontend + backend together |

---

## ✨ Live Demo

🚀 **[careerhub.example.com](https://careerhub.example.com)**

**Test credentials**

| Role | Email | Password |
|---|---|---|
| Admin | admin@careerhub.com | Admin@1234 |
| Recruiter | recruiter@careerhub.com | Recruiter@1234 |
| User | user@careerhub.com | User@1234 |

---

## 🚀 Features

### Authentication & Security
- **Register / Login / Logout** with httpOnly cookie-based JWT authentication
- **Email verification** flow via tokenised link
- **Forgot password** and **reset password** via secure email link
- **Token refresh queue** — concurrent 401 responses are queued and retried automatically after a silent token refresh, with graceful logout on failure
- **Session validation** on every app mount via `/auth/me`

### Role-Based Access Control
| Feature | Admin | Recruiter | User |
|---|:---:|:---:|:---:|
| Administrative dashboard | ✅ | — | — |
| Manage users (CRUD + role assignment) | ✅ | — | — |
| Post and manage job listings | — | ✅ | — |
| Review and action applications | — | ✅ | — |
| Browse and filter all jobs | ✅ | ✅ | ✅ |
| Apply to jobs | — | — | ✅ |
| View own applications with status | — | — | ✅ |
| Upload profile photo & resume | ✅ | ✅ | ✅ |
| Edit profile (username, location, gender) | ✅ | ✅ | ✅ |

### Job Board
- Browse all jobs with **server-side search, sort, filter** (type, status) and **pagination**
- Detailed job view (description, skills, facilities, salary, deadline)
- Recruiter job management: add, edit, delete with in-memory client-side cache

### Dashboard
- Role-aware **collapsible sidebar** navigation (portal-rendered)
- **Profile page** with avatar upload, resume upload, and info cards
- **Edit profile** form with optional-field validation

### Admin Panel
- Live **administrative information** (users, admins, recruiters, applicants, jobs, interviews)
- **User table** with search, pagination, role assignment, and user deletion (with cache invalidation)

### UI & UX
- Custom **toast notification system** (auto-dismiss, progress bar, pause-on-hover)
- **Confirm dialog** (portal-rendered, ESC key, focus trap, ARIA `role="dialog"`)
- Custom **DatePicker** calendar with min/max date range
- Custom **TagsInput** (Enter / comma to add, Backspace to remove last)
- Custom **Select** dropdown with keyboard navigation (↑ ↓ Enter Escape)
- Fully accessible **Sidebar** with focus trap, scroll lock, and keyboard dismiss
- **Skeleton loading states** and graceful error states with focus management

### Accessibility (A11y)
- All interactive elements are keyboard focusable (`<button>`, `<a>`, no `<span onClick>`)
- `aria-label`, `aria-busy`, `aria-invalid`, `aria-describedby` on all form controls
- Focus shifts programmatically on every state transition (error → heading, success → heading)
- Semantic HTML landmarks (`<nav>`, `<main>`, `<footer>`, `<header>`)
- `visually-hidden` class for screen-reader-only text

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 |
| **Language** | TypeScript |
| **Build Tool** | Vite |
| **State Management** | Redux Toolkit (slices, thunks, selectors) |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios (with interceptor queue) |
| **Styling** | CSS Modules (zero external UI library) |
| **Form Engine** | Custom `useForm` hook |
| **Validation** | Custom validation library (discriminated union rules) |
| **Notifications** | Custom toast system (Redux-backed) |


---

<p align="center">
  Built with ❤️ using React + TypeScript + Redux Toolkit
</p>
