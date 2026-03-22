import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { JobProvider } from './context/JobContext.jsx';
import LoginPage from './components/Auth/LoginPage.jsx';
import OnboardingPage from './components/Auth/OnboardingPage.jsx';
import Layout from './components/Layout.jsx';
import JobFeed from './components/Jobs/JobFeed.jsx';
import Dashboard from './components/Applications/Dashboard.jsx';
import AIChatBubble from './components/AI/AIChatBubble.jsx';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but no profile → go to onboarding
  // (skip this check if already on /onboarding to avoid redirect loop)
  if (!user.fullName && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Login — if already logged in with profile, go to home */}
      <Route path="/login"
        element={!user
          ? <LoginPage />
          : <Navigate to={user.fullName ? '/' : '/onboarding'} replace />
        }
      />

      {/* Onboarding — only for logged-in users without profile */}
      <Route path="/onboarding"
        element={!user
          ? <Navigate to="/login" replace />
          : user.fullName
            ? <Navigate to="/" replace />   // already completed, skip
            : <OnboardingPage />
        }
      />

      {/* Protected pages */}
      <Route path="/" element={
        <ProtectedRoute>
          <JobProvider>
            <Layout>
              <JobFeed />
              <AIChatBubble />
            </Layout>
          </JobProvider>
        </ProtectedRoute>
      } />

      <Route path="/applications" element={
        <ProtectedRoute>
          <JobProvider>
            <Layout>
              <Dashboard />
              <AIChatBubble />
            </Layout>
          </JobProvider>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
