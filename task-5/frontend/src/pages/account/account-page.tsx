import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/auth-context';
import styles from './account-page.module.scss';

const formatMemberSince = (value: string) => value.replace('T', ' ').slice(0, 10);

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
                        Signed in as <strong>{user.name}</strong>. This session is authenticated with a bearer token
                        issued by the Mission Control API.
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
                    <strong>{user.name}</strong>
                </article>
                <article>
                    <span>EMAIL</span>
                    <strong>{user.email}</strong>
                </article>
                <article>
                    <span>ROLE</span>
                    <strong>{user.role}</strong>
                </article>
                <article>
                    <span>MEMBER SINCE</span>
                    <strong>{formatMemberSince(user.createdAt)}</strong>
                </article>
                <article>
                    <span>ACCOUNT ID</span>
                    <strong>#{String(user.id).padStart(4, '0')}</strong>
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
