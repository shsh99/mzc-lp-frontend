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
  const mockEnvValue = import.meta.env.VITE_MOCK_ENABLED;
  const isMockEnabled = mockEnvValue === 'true';

  console.log('[App] VITE_MOCK_ENABLED raw value:', JSON.stringify(mockEnvValue), 'type:', typeof mockEnvValue);
  console.log('[App] Mock mode:', isMockEnabled, 'API Base URL:', import.meta.env.VITE_API_BASE_URL);

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
