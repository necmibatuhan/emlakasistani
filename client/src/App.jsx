import React, { useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UIProvider } from './contexts/UIContext';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import GlobalMobileNav from './components/GlobalMobileNav';
import QuickAddFAB from './components/QuickAddFAB';
import InstallPrompt from './components/InstallPrompt';

import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
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
import Analyzer from './pages/Analyzer';
import RegionalLanding from './pages/RegionalLanding';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  if (!user) return <Navigate to="/" />;

  if (user.created_at) {
    const createdDate = new Date(user.created_at);
    const now = new Date();
    const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);
    if (diffDays > 14 && user.plan === 'free') {
      return <Navigate to="/pricing?expired=true" replace />;
    }
  }

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

const HomeRoute = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  return user ? <Navigate to="/dashboard" /> : <Landing />;
};

const LoginRoute = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  return user ? <Navigate to="/dashboard" /> : <Auth />;
};

const queryClient = new QueryClient();

const RootLayout = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'GIRILECEK_GOOGLE_CLIENT_ID'}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UIProvider>
            <div className="pb-[56px] lg:pb-0">
              <Outlet />
              <QuickAddFAB />
              <GlobalMobileNav />
              <InstallPrompt />
            </div>
            <SpeedInsights />
            <Analytics />
          </UIProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: '/pricing', element: <Pricing /> },
      { path: '/login', element: <LoginRoute /> },
      { path: '/auth', element: <LoginRoute /> },
      { path: '/reset-password', element: <ResetPassword /> },
      { path: '/verify-email', element: <VerifyEmail /> },
      { path: '/aydinlatma-metni', element: <AydinlatmaMetni /> },
      { path: '/gizlilik-politikasi', element: <GizlilikPolitikasi /> },
      { path: '/blog', element: <BlogList /> },
      { path: '/blog/:slug', element: <BlogPost /> },
      { path: '/sehir/:slug-emlak-asistani', element: <RegionalLanding /> },
      { path: '/ilan-analizi', element: <Analyzer /> },
      { path: '/dashboard', element: <ProtectedRoute><RoleBasedDashboard /></ProtectedRoute> },
      { path: '/leads', element: <ProtectedRoute><Leads /></ProtectedRoute> },
      { path: '/integrations', element: <ProtectedRoute><Integrations /></ProtectedRoute> },
      { path: '/whatsapp', element: <ProtectedRoute><WhatsApp /></ProtectedRoute> },
      { path: '/properties', element: <ProtectedRoute><Properties /></ProtectedRoute> },
      { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: '/offices', element: <ProtectedRoute><Offices /></ProtectedRoute> },
      { path: '/offices/:id', element: <ProtectedRoute><OfficeDetail /></ProtectedRoute> },
      { path: '/agents', element: <ProtectedRoute><Agents /></ProtectedRoute> },
      { path: '/reports', element: <ProtectedRoute><Reports /></ProtectedRoute> },
      { path: '/stats', element: <ProtectedRoute><Stats /></ProtectedRoute> },
      { path: '/plans', element: <ProtectedRoute><Plans /></ProtectedRoute> },
      { path: '/payment-result', element: <ProtectedRoute><PaymentResult /></ProtectedRoute> },
      { path: '/mock-checkout', element: <ProtectedRoute><MockCheckout /></ProtectedRoute> },
      { path: '*', element: <Navigate to="/" /> }
    ]
  }
];

export default function App() {
  return null; // For standard vite run, main.jsx will handle rendering routes.
}
