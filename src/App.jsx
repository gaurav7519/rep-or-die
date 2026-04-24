import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ExerciseList from './pages/ExerciseList';
import Tracker from './pages/Tracker';
import Calendar from './pages/Calendar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="container text-center" style={{marginTop: '50vh'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="container text-center" style={{marginTop: '50vh'}}>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Auth />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="/exercises/:bodyPart" element={<ProtectedRoute><ExerciseList /></ProtectedRoute>} />
      <Route path="/track/:exerciseId" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
