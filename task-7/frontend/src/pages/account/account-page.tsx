import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/auth-context';
import styles from './account-page.module.scss';

export function AccountPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);

    if (!user) return null;

    const handleLogout = async () => {
        setLoggingOut(true);
        await logout();
        navigate('/');
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>OPERATOR PROFILE / ACTIVE SESSION</p>
                    <h1>Account</h1>
                    <p className={styles.lead}>
                        Signed in as <strong>{user.displayName ?? user.email}</strong>. Your Firebase session persists
                        across browser refreshes.
                    </p>
                </div>
                <button
                    className={styles.logout}
                    disabled={loggingOut}
                    type='button'
                    onClick={() => void handleLogout()}
                >
                    {loggingOut ? 'SIGNING OUT...' : 'SIGN OUT'}
                </button>
            </header>

            <section className={styles.grid}>
                <article>
                    <span>FULL NAME</span>
                    <strong>{user.displayName ?? '—'}</strong>
                </article>
                <article>
                    <span>EMAIL</span>
                    <strong>{user.email}</strong>
                </article>
                <article>
                    <span>ROLE</span>
                    <strong>OPERATOR</strong>
                </article>
                <article>
                    <span>MEMBER SINCE</span>
                    <strong>{user.metadata.creationTime?.slice(0, 10) ?? '—'}</strong>
                </article>
                <article>
                    <span>ACCOUNT ID</span>
                    <strong>{user.uid}</strong>
                </article>
                <article>
                    <span>SESSION</span>
                    <strong className={styles.active}>AUTHENTICATED</strong>
                </article>
            </section>

            <section className={styles.actions}>
                <div>
                    <h2>Continue operations</h2>
                    <p>Manage the manifest, review analytics or launch a new mission from your account.</p>
                </div>
                <div className={styles.links}>
                    <Link className={styles.primary} to='/missions/new'>
                        LAUNCH MISSION
                    </Link>
                    <Link className={styles.secondary} to='/missions'>
                        VIEW MISSIONS
                    </Link>
                    <Link className={styles.secondary} to='/dashboard'>
                        DASHBOARD
                    </Link>
                </div>
            </section>
        </div>
    );
}
