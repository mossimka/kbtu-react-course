import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCacheAge } from '../../pwa/format-cache-age';
import { usePwa } from '../../pwa/use-pwa';
import styles from './connectivity-banner.module.scss';

export const ConnectivityBanner = () => {
    const { online, usingCachedData, cacheAgeSeconds } = usePwa();
    const [retryMessage, setRetryMessage] = useState<string | null>(null);

    if (online && !usingCachedData) return null;

    const cachedAge = formatCacheAge(cacheAgeSeconds);
    const handleRetry = () => {
        if (navigator.onLine) {
            window.location.reload();
            return;
        }
        setRetryMessage('Still offline. Check your connection and try again.');
    };

    return (
        <div className={`${styles.root} ${online ? styles.cached : styles.offline}`} role='status' aria-live='polite'>
            <div className={styles.message}>
                <strong>
                    {online ? 'SAVED DATA' : usingCachedData ? 'OFFLINE MODE · SAVED DATA' : 'OFFLINE MODE'}
                </strong>
                <span>
                    {online
                        ? `You are viewing public mission data saved ${cachedAge}. New requests will refresh it automatically.`
                        : usingCachedData
                          ? `The network is unavailable. You are viewing public mission data saved ${cachedAge}; previously visited pages remain accessible.`
                          : 'The network is unavailable. Previously visited pages and saved public mission data are still accessible.'}
                </span>
                {retryMessage && !online && <span className={styles.retryMessage}>{retryMessage}</span>}
            </div>
            <div className={styles.actions}>
                {online ? (
                    <button type='button' onClick={() => window.location.reload()}>
                        Refresh data
                    </button>
                ) : (
                    <button type='button' onClick={handleRetry}>
                        Retry connection
                    </button>
                )}
                <Link to='/offline'>Offline details</Link>
            </div>
        </div>
    );
};
