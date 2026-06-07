/**
 * @file src/routes/app-router/index.tsx
 */

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazyWithSuspense } from "../with-suspense";
import { CanActivate } from "@/components/guards";
import { Role } from "@/lib/types";

// import ErrorBoundary from "@/pages/error-boundary";
import ErrorElement from "@/pages/error-element";

const RecruiterApplications = lazyWithSuspense(
  () => import("@/pages/dashboard/recruiter/recruiter-applications"),
);
const AdministrativeInformation = lazyWithSuspense(
  () => import("@/pages/dashboard/admin/administrative-information"),
);
const MainLayout = lazyWithSuspense(() => import("@/layouts/main-layout"));
const SendResetPasswordLinkComponent = lazyWithSuspense(
  () => import("@/pages/password/send-reset-password-link.component"),
);
const JobDetails = lazyWithSuspense(() => import("@/pages/job-details"));
const HomePage = lazyWithSuspense(() => import("@/pages/home-page"));
const JobsPage = lazyWithSuspense(() => import("@/pages/jobs-page"));
const GetResetPasswordLinkComponent = lazyWithSuspense(
  () => import("@/pages/password/get-reset-password-link.component"),
);
const EditRecruiterJob = lazyWithSuspense(
  () => import("@/pages/dashboard/recruiter/edit-recruiter-job"),
);
const CandidateApplications = lazyWithSuspense(
  () => import("@/pages/dashboard/user/candidate-applications"),
);
const RecruiterJobs = lazyWithSuspense(
  () => import("@/pages/dashboard/recruiter/recruiter-jobs"),
);
const EmailVerification = lazyWithSuspense(
  () => import("@/pages/auth/email-verification.component"),
);
const ResetPasswordComponent = lazyWithSuspense(
  () => import("@/pages/password/reset-password.component"),
);
const AddRecruiterJob = lazyWithSuspense(
  () => import("@/pages/dashboard/recruiter/add-recruiter-job"),
);
const ManageUsers = lazyWithSuspense(
  () => import("@/pages/dashboard/admin/manage-users"),
);
const Notifications = lazyWithSuspense(
  () => import("@/pages/dashboard/notifications"),
);
const ViewProfile = lazyWithSuspense(
  () => import("@/pages/dashboard/view-profile"),
);
const EditProfile = lazyWithSuspense(
  () => import("@/pages/dashboard/edit-profile"),
);
const RegisterComponent = lazyWithSuspense(
  () => import("@/pages/auth/register.component"),
);
const LoginComponent = lazyWithSuspense(
  () => import("@/pages/auth/login.component"),
);
const DashboardLayout = lazyWithSuspense(
  () => import("@/layouts/dashboard-layout"),
);

const routes = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        // <ErrorBoundary>
        <MainLayout />
        // </ErrorBoundary>
      ),
      errorElement: <ErrorElement />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: "auth/register",
          element: <RegisterComponent />,
        },
        {
          path: "auth/login",
          element: <LoginComponent />,
        },
        {
          path: "users/:userId/verify/:token",
          element: <EmailVerification />,
        },
        {
          path: "password/send-reset-password-link",
          element: <SendResetPasswordLinkComponent />,
        },
        {
          path: `password/verify-reset-token/:userId/:token`,
          element: <GetResetPasswordLinkComponent />,
        },
        {
          path: `password/reset-password/:userId/:token`,
          element: <ResetPasswordComponent />,
        },
        {
          path: "jobs",
          element: <JobsPage />,
        },
        {
          path: "jobs/:jobId/details",
          element: <JobDetails />,
        },
        {
          path: "/dashboard",
          element: (
            <CanActivate roles={[Role.Admin, Role.Recruiter, Role.User]}>
              <DashboardLayout />
            </CanActivate>
          ),
          children: [
            {
              index: true,
              element: <ViewProfile />,
            },
            {
              path: "edit-profile/:userId",
              element: <EditProfile />,
            },
            {
              path: "administrative-information",
              element: (
                <CanActivate roles={[Role.Admin]}>
                  <AdministrativeInformation />
                </CanActivate>
              ),
            },
            {
              path: "manage-users",
              element: (
                <CanActivate roles={[Role.Admin]}>
                  <ManageUsers />
                </CanActivate>
              ),
            },
            {
              path: "add-job",
              element: (
                <CanActivate roles={[Role.Recruiter]}>
                  <AddRecruiterJob />
                </CanActivate>
              ),
            },
            {
              path: "recruiter-jobs",
              element: (
                <CanActivate roles={[Role.Recruiter]}>
                  <RecruiterJobs />
                </CanActivate>
              ),
            },
            {
              path: "/dashboard/recruiter-jobs/:jobId/edit",
              element: (
                <CanActivate roles={[Role.Recruiter]}>
                  <EditRecruiterJob />
                </CanActivate>
              ),
            },
            {
              path: "recruiter-applications",
              element: (
                <CanActivate roles={[Role.Recruiter]}>
                  <RecruiterApplications />
                </CanActivate>
              ),
            },
            {
              path: "user-applications",
              element: (
                <CanActivate roles={[Role.User]}>
                  <CandidateApplications />
                </CanActivate>
              ),
            },
            {
              path: "notifications",
              element: (
                <CanActivate roles={[Role.User, Role.Recruiter]}>
                  <Notifications />
                </CanActivate>
              ),
            },
          ],
        },
      ],
    },
  ],
  // { basename: "/op-career-hub/" },
);

const AppRouter = () => {
  return <RouterProvider router={routes} />;
};

export default AppRouter;
