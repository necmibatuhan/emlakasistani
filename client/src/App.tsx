import React, { useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UIProvider } from './contexts/UIContext';
import { Navigate, Outlet, useRouteError } from 'react-router-dom';
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

const GlobalErrorBoundary = () => {
  const error = useRouteError();
  
  // If we get a JSON parse error or chunk load error (usually due to stale PWA cache or version mismatch)
  // We force a hard reload to get the latest assets from the server
  if (
    error?.message?.includes('JSON.parse') || 
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Unexpected token') ||
    error?.message?.includes('Load failed')
  ) {
    window.location.reload();
    return <div className="min-h-screen flex items-center justify-center bg-[#0A0B0D] text-white">Güncelleniyor...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0B0D] p-6 text-center">
      <div className="w-16 h-16 bg-[#EF4444]/20 text-[#EF4444] rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Bir Sorun Oluştu</h1>
      <p className="text-[#7C8090] mb-6 max-w-md">Uygulama yüklenirken beklenmedik bir hata meydana geldi. Lütfen sayfayı yenileyin.</p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-[#F5A623] hover:bg-[#FF8C00] text-black font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        Sayfayı Yenile
      </button>
      <details className="mt-8 text-left text-xs text-[#7C8090] bg-[#16181D] p-4 rounded border border-[#2A2D35] max-w-2xl overflow-auto hidden">
        <summary className="cursor-pointer mb-2">Hata Detayları</summary>
        <pre>{error?.message || error?.toString()}</pre>
      </details>
    </div>
  );
};

export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <GlobalErrorBoundary />,
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
