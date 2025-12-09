import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from './features/auth/store/authStore';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import NewLandingPage from './pages/NewLandingPage';
import SampleDataViewer from './pages/SampleDataViewer';
import AnalysisProgressPage from './pages/AnalysisProgressPage';
import ReportPage from './pages/ReportPage';
import UserGuidePage from './pages/UserGuidePage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Public Route Component (redirect if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <NewLandingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sample-viewer',
    element: (
      <ProtectedRoute>
        <SampleDataViewer />
      </ProtectedRoute>
    ),
  },
  {
    path: '/analysis',
    element: (
      <ProtectedRoute>
        <AnalysisProgressPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/report',
    element: (
      <ProtectedRoute>
        <ReportPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/user-guide',
    element: (
      <ProtectedRoute>
        <UserGuidePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
