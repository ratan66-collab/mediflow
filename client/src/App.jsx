

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ReportUpload from './pages/ReportUpload';
import Dashboard from './pages/Dashboard';
import Physio from './pages/Physio';
import AIAssistant from './pages/AIAssistant';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 1. We replace the clunky default widget with our custom sleek button
import VoiceAssistantButton from './components/VoiceAssistantButton';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wipe dashboard cache universally EXACTLY once per raw physical browser tab session block
  if (!sessionStorage.getItem('mediflow_booted')) {
    sessionStorage.setItem('mediflow_booted', 'true');
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('dashboard_analysis_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) { }
  }

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="reports" element={<ReportUpload />} />
            <Route path="physio" element={<Physio />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>

      {/* 2. Custom Sleek Voice Button */}
      <VoiceAssistantButton />

    </AuthProvider>
  );
}

export default App;