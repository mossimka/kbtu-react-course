import { formatCacheAge } from '../../pwa/format-cache-age';
import { usePwa } from '../../pwa/use-pwa';
import styles from './network-status.module.scss';

export const NetworkStatus = () => {
    const { online, usingCachedData, cacheAgeSeconds } = usePwa();
    const mode = !online ? 'offline' : usingCachedData ? 'cached' : 'online';
    const label = !online ? 'Offline' : usingCachedData ? 'Saved data' : 'Online';
    const title = !online
        ? usingCachedData
            ? `No network connection. Showing saved public mission data (${formatCacheAge(cacheAgeSeconds)}).`
            : 'No network connection. Cached pages and saved public data remain available.'
        : usingCachedData
          ? `Showing cached public mission data (${formatCacheAge(cacheAgeSeconds)}).`
          : 'Connected to the network.';

    return (
        <span className={`${styles.root} ${styles[mode]}`} role='status' aria-live='polite' title={title}>
            <i aria-hidden='true' />
            <span className={styles.label}>{label}</span>
            {usingCachedData && <span className={styles.detail}>{formatCacheAge(cacheAgeSeconds)}</span>}
        </span>
    );
};
