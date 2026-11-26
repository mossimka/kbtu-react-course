import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOnlineStatus } from '../../pwa/use-online-status';
import styles from './offline-page.module.scss';

const checkConnection = async (): Promise<boolean> => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);

    try {
        const response = await fetch(`${import.meta.env.BASE_URL}manifest.json?connection-check=${Date.now()}`, {
            cache: 'no-store',
            signal: controller.signal,
        });
        return response.ok;
    } catch {
        return false;
    } finally {
        window.clearTimeout(timeout);
    }
};

export function OfflinePage() {
    const online = useOnlineStatus();
    const [checking, setChecking] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const wasOnline = useRef(online);

    useEffect(() => {
        if (!wasOnline.current && online) {
            const timer = window.setTimeout(() => window.location.reload(), 1500);
            wasOnline.current = online;
            return () => window.clearTimeout(timer);
        }
        wasOnline.current = online;
        return undefined;
    }, [online]);

    const retry = async () => {
        setChecking(true);
        setMessage(null);

        if (!navigator.onLine) {
            setChecking(false);
            setMessage('Still offline. Enable Wi-Fi or mobile data, then try again.');
            return;
        }

        const reachable = await checkConnection();
        setChecking(false);

        if (reachable) {
            setMessage('Connection restored. Reloading the application…');
            window.location.reload();
            return;
        }

        setMessage('The network is still unreachable. Check your connection and try again.');
    };

    return (
        <section className={styles.page}>
            <div className={styles.signal}>
                <span>{online ? 'NETWORK LINK RESTORED' : 'DEEP SPACE LINK LOST'}</span>
                <strong className={online ? styles.online : styles.offline}>
                    <i aria-hidden='true' /> {online ? 'Online' : 'Offline'}
                </strong>
            </div>

            <div className={styles.grid}>
                <div className={styles.copy}>
                    <p className={styles.eyebrow}>OFFLINE PROTOCOL / CACHED OPERATIONS</p>
                    <h1>Signal beyond range.</h1>
                    <p className={styles.lead}>
                        Mission Control cannot reach the network right now. The application shell, previously visited
                        pages and public mission data saved during your last successful sync remain available offline.
                    </p>

                    <div className={styles.status} role='status' aria-live='polite'>
                        {online ? (
                            <p>
                                <strong>You are back online.</strong> Reload the application to restore live API
                                requests.
                            </p>
                        ) : (
                            <p>
                                <strong>You are offline.</strong> Pages marked “saved data” are served from a versioned
                                runtime cache.
                            </p>
                        )}
                        {message && <p className={styles.message}>{message}</p>}
                    </div>

                    <div className={styles.actions}>
                        <button type='button' disabled={checking} onClick={() => void retry()}>
                            {checking ? 'CHECKING…' : '↻ RETRY CONNECTION'}
                        </button>
                        <Link to='/missions'>OPEN CACHED MISSIONS</Link>
                        <Link to='/'>RETURN HOME</Link>
                    </div>
                </div>

                <aside className={styles.panel} aria-label='Offline capabilities'>
                    <p className={styles.eyebrow}>AVAILABLE OFFLINE</p>
                    <ul>
                        <li>
                            <span>01</span>
                            <div>
                                <strong>Application shell</strong>
                                <p>HTML, JavaScript, CSS and icons are precached at install time.</p>
                            </div>
                        </li>
                        <li>
                            <span>02</span>
                            <div>
                                <strong>Visited routes</strong>
                                <p>The last successful navigation response for each route is cached.</p>
                            </div>
                        </li>
                        <li>
                            <span>03</span>
                            <div>
                                <strong>Public mission API</strong>
                                <p>List and detail responses are stored for up to 24 hours and 60 entries.</p>
                            </div>
                        </li>
                    </ul>
                    <p className={styles.note}>
                        Authentication, tokens and private user records are never written to shared runtime caches.
                    </p>
                </aside>
            </div>
        </section>
    );
}
