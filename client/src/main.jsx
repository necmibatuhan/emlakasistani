import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-mono/500.css';
import '@fontsource/geist-mono/600.css';
import './index.css';
import App from './App.jsx'
import { UIProvider } from './contexts/UIContext.jsx';

import { GoogleOAuthProvider } from '@react-oauth/google';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'MOCK_CLIENT_ID'}>
      <QueryClientProvider client={queryClient}>
        <UIProvider>
          <App />
        </UIProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
