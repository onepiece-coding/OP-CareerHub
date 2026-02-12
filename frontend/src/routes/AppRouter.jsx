import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LazySuspence } from "../components/feedback";
import JobsContextProvider from "../contexts/JobsContextProvider";
import ProtectedRoute from "../components/auth/ProtectedRoute";

const MainLayout = lazy(() => import("../layouts/MainLayout"));
const ErrorPage = lazy(() => import("../pages/error"));
const Home = lazy(() => import("../pages/home"));
const Jobs = lazy(() => import("../pages/jobs"));
const JobDetails = lazy(() => import("../pages/job-details"));
const Register = lazy(() => import("../pages/auth/Register"));
const Login = lazy(() => import("../pages/auth/Login"));
const ForgotPassword = lazy(() => import("../pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("../pages/auth//reset-password"));
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const ViewProfile = lazy(() => import("../pages/dashboard/view-profile"));
const EditProfile = lazy(() => import("../pages/dashboard/edit-profile"));
const Applications = lazy(() => import("../pages/dashboard/applications"));
const RecruiterJobs = lazy(() => import("../pages/dashboard/recruiter-jobs"));
const AddJob = lazy(() => import("../pages/dashboard/add-job"));
const ManageJobs = lazy(() => import("../pages/dashboard/manage-jobs"));
const EditJob = lazy(() => import("../pages/dashboard/edit-job"));
const Notifications = lazy(() => import("../pages/dashboard/notifications"));
const Stats = lazy(() => import("../pages/dashboard/stats"));
const Admin = lazy(() => import("../pages/dashboard/admin"));
const ManageUsers = lazy(() => import("../pages/dashboard/manage-users"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LazySuspence height="h-screen">
        <MainLayout />
      </LazySuspence>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <LazySuspence>
            <Home />
          </LazySuspence>
        ),
      },
      {
        path: "/jobs",
        element: (
          <LazySuspence>
            <JobsContextProvider>
              <Jobs />
            </JobsContextProvider>
          </LazySuspence>
        ),
      },
      {
        path: "/job-details/:id",
        element: (
          <LazySuspence>
            <JobDetails />
          </LazySuspence>
        ),
      },
      {
        path: "/register",
        element: (
          <LazySuspence>
            <Register />
          </LazySuspence>
        ),
      },
      {
        path: "/login",
        element: (
          <LazySuspence>
            <Login />
          </LazySuspence>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <LazySuspence>
            <ForgotPassword />
          </LazySuspence>
        ),
      },
      {
        path: "/reset-password/:token",
        element: (
          <LazySuspence>
            <ResetPassword />
          </LazySuspence>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <LazySuspence>
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          </LazySuspence>
        ),
        children: [
          {
            index: true,
            element: (
              <LazySuspence>
                <ProtectedRoute>
                  <ViewProfile />
                </ProtectedRoute>
              </LazySuspence>
            ),
          },
          {
            path: "edit-profile/:id",
            element: (
              <LazySuspence>
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              </LazySuspence>
            ),
          },
          {
            path: "my-jobs",
            element: (
              <LazySuspence>
                <ProtectedRoute roles={["recruiter", "user"]}>
                  <Applications />
                </ProtectedRoute>
              </LazySuspence>
            ),
          },
          {
            path: "recruiter-jobs/:jobId",
            element: (
              <LazySuspence>
                <ProtectedRoute roles={["recruiter"]}>
                  <RecruiterJobs />
                </ProtectedRoute>
              </LazySuspence>
            ),
          },
          {
            path: "add-job",
            element: (
              <LazySuspence>
                <ProtectedRoute roles={["recruiter"]}>
                  <AddJob />
                </ProtectedRoute>
              </LazySuspence>
            ),
          },
          {
            path: "manage-jobs",
            element: (
              <LazySuspence>
                <ProtectedRoute roles={["recruiter"]}>
                  <ManageJobs />
                </ProtectedRoute>
              </LazySuspence>
            ),
          },
          {
            path: "edit-job/:id",
            element: (
              <LazySuspence>
                <ProtectedRoute roles={["recruiter"]}>
                  <EditJob />
                </ProtectedRoute>
              </LazySuspence>
            ),
          },
          {
            path: "notifications",
            element: (
              <LazySuspence>
                <ProtectedRoute roles={["recruiter", "user"]}>
                  <Notifications />
                </ProtectedRoute>
              </LazySuspence>
            ),
          },
          {
            path: "stats",
            element: (
              <LazySuspence>
                <ProtectedRoute roles={["admin"]}>
                  <Stats />
                </ProtectedRoute>
              </LazySuspence>
            ),
          },
          {
            path: "admin",
            element: (
              <LazySuspence>
                <ProtectedRoute roles={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              </LazySuspence>
            ),
          },
          {
            path: "manage-users",
            element: (
              <LazySuspence>
                <ProtectedRoute roles={["admin"]}>
                  <ManageUsers />
                </ProtectedRoute>
              </LazySuspence>
            ),
          },
        ],
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
