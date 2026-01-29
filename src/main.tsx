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
  // Mock mode: enable when VITE_MOCK_ENABLED is 'true' OR when API URL is '/api' (frontend-only deployment)
  const mockEnvValue = import.meta.env.VITE_MOCK_ENABLED;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // Enable mock when explicitly set OR when using relative /api path (no backend)
  const isMockEnabled = mockEnvValue === 'true' || apiBaseUrl === '/api';

  console.log('[App] Mock check:', { mockEnvValue, apiBaseUrl, isMockEnabled });

  if (!isMockEnabled) {
    console.log('[App] Mock mode disabled, skipping MSW initialization');
    return;
  }

  try {
    const { worker } = await import('./mocks/browser');
    console.log('[App] MSW worker imported, starting...');

    // Start the worker with onUnhandledRequest set to 'bypass' to allow real requests to pass through
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    console.log('[App] MSW worker started successfully');
  } catch (error) {
    console.error('[App] MSW worker failed to start:', error);
  }
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
