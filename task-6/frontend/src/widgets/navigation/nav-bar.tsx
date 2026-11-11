import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/auth-context';
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

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className={styles.root}>
            <NavLink to='/' className={styles.brand}>
                <span className={styles.mark} aria-hidden='true'>
                    ✦
                </span>
                <span>
                    ORBITAL
                    <small>MISSION CONTROL</small>
                </span>
            </NavLink>

            <nav className={styles.nav} aria-label='Primary navigation'>
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                    >
                        {link.label}
                    </NavLink>
                ))}

                {user ? (
                    <>
                        <NavLink
                            to='/profile'
                            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                        >
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
                        <NavLink
                            to='/login'
                            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                        >
                            Login
                        </NavLink>
                        <NavLink
                            to='/signup'
                            className={({ isActive }) =>
                                `${styles.link} ${styles.signup} ${isActive ? styles.active : ''}`
                            }
                        >
                            Sign up
                        </NavLink>
                    </>
                )}
            </nav>
        </header>
    );
};
