import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageLoader } from '../../shared/ui/page-loader/page-loader';
import { NavBar } from '../navigation/nav-bar';
import { ConnectivityBanner } from '../pwa/connectivity-banner';
import { UpdatePrompt } from '../pwa/update-prompt';
import styles from './root-layout.module.scss';

export const RootLayout = () => (
    <div className={styles.shell}>
        <NavBar />
        <ConnectivityBanner />
        <main className={styles.content}>
            <Suspense fallback={<PageLoader />}>
                <Outlet />
            </Suspense>
        </main>
        <footer className={styles.footer}>
            <span>ORBITAL // MISSION CONTROL</span>
            <span>DEEP SPACE OPERATIONS</span>
        </footer>
        <UpdatePrompt />
    </div>
);
