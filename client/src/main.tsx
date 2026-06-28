import { StrictMode } from 'react'
import { ViteReactSSG } from 'vite-react-ssg'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-mono/500.css';
import '@fontsource/geist-mono/600.css';
import './index.css';
import { UIProvider } from './contexts/UIContext.jsx';
import { routes } from './App.jsx'

const queryClient = new QueryClient();

export const createRoot = ViteReactSSG(
  {
    routes,
    basename: import.meta.env.BASE_URL,
  }
)

