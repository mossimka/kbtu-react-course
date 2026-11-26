import { useSyncExternalStore } from 'react';
import styles from './network-status.module.scss';

const subscribe = (callback: () => void) => {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
    };
};

export const NetworkStatus = () => {
    const online = useSyncExternalStore(subscribe, () => navigator.onLine);

    return (
        <p className={`${styles.root} ${online ? styles.online : styles.offline}`} role='status' aria-live='polite'>
            <i aria-hidden='true' />
            {online ? 'Online' : 'Offline - showing cached data'}
        </p>
    );
};
