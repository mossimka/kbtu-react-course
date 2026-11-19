import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            // Always run the query function so the service worker can serve
            // cached public API data while the browser is offline.
            networkMode: 'always',
            retry: 1,
        },
    },
});

export const invalidateMissionQueries = () => queryClient.invalidateQueries({ queryKey: ['missions'] });
