import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Auth from '../pages/Auth';
import Calendar from '../pages/Calendar';
import Dashboard from '../pages/Dashboard';
import ExerciseList from '../pages/ExerciseList';
import Tracker from '../pages/Tracker';

function LoadingScreen() {
  return (
    <div className="container text-center" style={{ marginTop: '50vh' }}>
      Loading...
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/calendar"
        element={(
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/exercises/:bodyPart"
        element={(
          <ProtectedRoute>
            <ExerciseList />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/track/:exerciseId"
        element={(
          <ProtectedRoute>
            <Tracker />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}
