import { useSyncExternalStore } from 'react';
import { getPwaState, subscribePwa } from './pwa-store';

export const usePwa = () => useSyncExternalStore(subscribePwa, getPwaState, getPwaState);
