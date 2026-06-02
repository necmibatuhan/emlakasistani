import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './contexts/AuthContext';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import CompanyDashboard from './pages/CompanyDashboard';
import OfficeDashboard from './pages/OfficeDashboard';
import AgentDashboard from './pages/AgentDashboard';
import WhatsApp from './pages/WhatsApp';
import Stats from './pages/Stats';
import Plans from './pages/Plans';
import Properties from './pages/Properties';
import Profile from './pages/Profile';
import Offices from './pages/Offices';
import Agents from './pages/Agents';
import Reports from './pages/Reports';
import OfficeDetail from './pages/OfficeDetail';
import VerifyEmail from './pages/VerifyEmail';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  if (!user) return <Navigate to="/" />;
  return children;
};

const RoleBasedDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/" />;

  if (user.role === 'company_admin' || user.role === 'super_admin') {
    return <CompanyDashboard />;
  } else if (user.role === 'office_manager') {
    return <OfficeDashboard />;
  } else {
    return <AgentDashboard />;
  }
};

const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/verify-email" element={user ? <Navigate to="/dashboard" /> : <VerifyEmail />} />
      <Route path="/dashboard" element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />
      <Route path="/whatsapp" element={<ProtectedRoute><WhatsApp /></ProtectedRoute>} />
      <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/offices" element={<ProtectedRoute><Offices /></ProtectedRoute>} />
      <Route path="/offices/:id" element={<ProtectedRoute><OfficeDetail /></ProtectedRoute>} />
      <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
      <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
    </Routes>
  );
};

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
