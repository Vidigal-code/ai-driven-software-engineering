import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './app/router';
import { SessionProvider } from './app/providers/SessionProvider';
import { ApiError } from './shared/api/client';
import './app/styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failures, error) =>
        !(error instanceof ApiError && error.status < 500) && failures < 1,
      refetchOnWindowFocus: false,
    },
  },
});
const root = document.getElementById('root');
if (!root) throw new Error('Elemento raiz não encontrado.');
createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionProvider>
          <AppRouter />
        </SessionProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
