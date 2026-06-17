import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import CompanyDashboard from './pages/CompanyDashboard';
import OfficeDashboard from './pages/OfficeDashboard';
import AgentDashboard from './pages/AgentDashboard';
import Leads from './pages/Leads';
import Integrations from './pages/Integrations';
import WhatsApp from './pages/WhatsApp';
import Stats from './pages/Stats';
import Plans from './pages/Plans';
import PaymentResult from './pages/PaymentResult';
import Properties from './pages/Properties';
import Profile from './pages/Profile';
import Offices from './pages/Offices';
import Agents from './pages/Agents';
import Reports from './pages/Reports';
import OfficeDetail from './pages/OfficeDetail';
import VerifyEmail from './pages/VerifyEmail';
import AydinlatmaMetni from './pages/AydinlatmaMetni';
import GizlilikPolitikasi from './pages/GizlilikPolitikasi';
import MockCheckout from './pages/MockCheckout';

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
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/aydinlatma-metni" element={<AydinlatmaMetni />} />
      <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/dashboard" element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
      <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
      <Route path="/whatsapp" element={<ProtectedRoute><WhatsApp /></ProtectedRoute>} />
      <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/offices" element={<ProtectedRoute><Offices /></ProtectedRoute>} />
      <Route path="/offices/:id" element={<ProtectedRoute><OfficeDetail /></ProtectedRoute>} />
      <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
      <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
      <Route path="/payment-result" element={<ProtectedRoute><PaymentResult /></ProtectedRoute>} />
      <Route path="/mock-checkout" element={<ProtectedRoute><MockCheckout /></ProtectedRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'GIRILECEK_GOOGLE_CLIENT_ID'}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <SpeedInsights />
          <Analytics />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
