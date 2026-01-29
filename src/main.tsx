import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

async function enableMocking() {
  // Mock mode is enabled when VITE_MOCK_ENABLED is true or when API is not available
  const isMockEnabled = import.meta.env.VITE_MOCK_ENABLED === 'true';

  if (!isMockEnabled) {
    return;
  }

  const { worker } = await import('./mocks/browser');

  // Start the worker with onUnhandledRequest set to 'bypass' to allow real requests to pass through
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
});
