import { createBrowserRouter, Navigate } from 'react-router-dom';
import React from 'react';
import Login                  from '../pages/Login.jsx';
import Signup                 from '../pages/Signup.jsx';
import ForgotPassword         from '../pages/ForgotPassword.jsx';
import App                    from '../App.jsx';
import ProtectedRoute         from '../components/ProtectedRoute.jsx';
import RoleProtectedRoute     from '../components/RoleProtectedRoute.jsx';
import ManagerDashboard       from '../pages/ManagerDashboard.jsx';
import EmployeeDashboard      from '../pages/EmployeeDashboard.jsx';
import CreateProject          from '../components/CreateProject.jsx';
import ProjectDetailPage      from '../pages/ProjectDetailPage.jsx';
import EmployeeWeeklyTracking from '../pages/EmployeeWeeklyTracking.jsx';
import LauncherPage           from '../pages/LauncherPage.jsx';

const router = createBrowserRouter([
  // Root redirect
  { path: '/', element: <Navigate to="/login" replace /> },

  // ── Public routes ────────────────────────────────────────────────────────
  { path: '/login',           element: <Login />           },
  { path: '/signup',          element: <Signup />          },
  { path: '/forgot-password', element: <ForgotPassword />  },

  // ── Protected routes ─────────────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/launcher', element: <LauncherPage /> },
      {
        element: <App />,
        children: [
          { path: '/create-project', element: <CreateProject /> },
          {
            element: <RoleProtectedRoute allowedType="manager" />,
            children: [
              { path: '/dashboard/manager/:employeeId',                              element: <ManagerDashboard />       },
              { path: '/dashboard/manager/:employeeId/project/:projectId',           element: <ProjectDetailPage />      },
              { path: '/dashboard/manager/:employeeId/track-employee/:targetEmpId',  element: <EmployeeWeeklyTracking /> },
            ],
          },
          {
            element: <RoleProtectedRoute allowedType="employee" />,
            children: [
              { path: '/dashboard/employee/:employeeId', element: <EmployeeDashboard /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
