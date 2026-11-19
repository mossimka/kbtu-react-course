import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth/auth-provider';
import { usePwa } from '../pwa/use-pwa';
import { queryClient } from '../services/query-client';
import { AppRoutes } from './routes';

const baseUrl = import.meta.env.BASE_URL;
const basename = baseUrl === '/' ? undefined : baseUrl.replace(/\/$/, '');

export default function App() {
    const { firstControl } = usePwa();

    // The very first visit fetches data before the service worker is active, so
    // those responses cannot be stored in the runtime API cache. Refetch the
    // active queries as soon as the new worker takes control of the page.
    useEffect(() => {
        if (!firstControl) return;
        void queryClient.invalidateQueries();
    }, [firstControl]);

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter basename={basename}>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
