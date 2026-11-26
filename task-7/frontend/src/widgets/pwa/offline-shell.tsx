import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOnlineStatus } from '../../pwa/use-online-status';

const OFFLINE_ROUTE = '/offline';

/**
 * App-shell guard.
 *
 * The service worker precaches the shell, so the application can boot without
 * a network connection. This guard makes the booted shell show the dedicated
 * offline page as soon as the connection is lost.
 *
 * The redirect is handled once per offline period: links from the offline page
 * to cached routes (for example, previously loaded missions) keep working
 * until the connection is restored.
 */
export const OfflineShell = () => {
    const online = useOnlineStatus();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const handledOffline = useRef(false);

    useEffect(() => {
        if (online) {
            handledOffline.current = false;
            return;
        }

        if (handledOffline.current) return;
        handledOffline.current = true;

        if (pathname !== OFFLINE_ROUTE) {
            navigate(OFFLINE_ROUTE, { replace: true });
        }
    }, [navigate, online, pathname]);

    return null;
};
