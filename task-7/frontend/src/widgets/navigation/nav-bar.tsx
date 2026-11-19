import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/auth-context';
import { NetworkStatus } from '../pwa/network-status';
import styles from './nav-bar.module.scss';

const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/about', label: 'About', end: false },
    { to: '/missions', label: 'Missions', end: false },
    { to: '/dashboard', label: 'Dashboard', end: false },
];

export const NavBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const locationKey = `${location.pathname}${location.search}`;
    const [menu, setMenu] = useState<{ open: boolean; path: string }>({ open: false, path: locationKey });
    const menuOpen = menu.open && menu.path === locationKey;
    const headerRef = useRef<HTMLElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    const closeMenu = useCallback(() => setMenu({ open: false, path: locationKey }), [locationKey]);
    const toggleMenu = () => setMenu({ open: !menuOpen, path: locationKey });

    useEffect(() => {
        if (!menuOpen) return undefined;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMenu();
                menuButtonRef.current?.focus();
            }
        };

        const handlePointerDown = (event: PointerEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('pointerdown', handlePointerDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [menuOpen, closeMenu]);

    const handleLogout = async () => {
        await logout();
        closeMenu();
        navigate('/');
    };

    const linkClass = ({ isActive }: { isActive: boolean }) => `${styles.link} ${isActive ? styles.active : ''}`;

    return (
        <header className={styles.root} ref={headerRef}>
            <NavLink to='/' className={styles.brand}>
                <span className={styles.mark} aria-hidden='true'>
                    ✦
                </span>
                <span>
                    ORBITAL
                    <small>MISSION CONTROL</small>
                </span>
            </NavLink>

            <div className={styles.right}>
                <nav
                    id='primary-navigation'
                    className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
                    aria-label='Primary navigation'
                >
                    {links.map((link) => (
                        <NavLink key={link.to} to={link.to} end={link.end} className={linkClass} onClick={closeMenu}>
                            {link.label}
                        </NavLink>
                    ))}

                    {user ? (
                        <>
                            <NavLink to='/profile' className={linkClass} onClick={closeMenu}>
                                Profile
                            </NavLink>
                            <button
                                className={`${styles.link} ${styles.logout}`}
                                type='button'
                                onClick={() => void handleLogout()}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to='/login' className={linkClass} onClick={closeMenu}>
                                Login
                            </NavLink>
                            <NavLink
                                to='/signup'
                                className={({ isActive }) =>
                                    `${styles.link} ${styles.signup} ${isActive ? styles.active : ''}`
                                }
                                onClick={closeMenu}
                            >
                                Sign up
                            </NavLink>
                        </>
                    )}
                </nav>

                <NetworkStatus />

                <button
                    className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ''}`}
                    ref={menuButtonRef}
                    type='button'
                    aria-controls='primary-navigation'
                    aria-expanded={menuOpen}
                    aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    onClick={toggleMenu}
                >
                    <span aria-hidden='true' />
                    <span aria-hidden='true' />
                    <span aria-hidden='true' />
                </button>
            </div>
        </header>
    );
};
