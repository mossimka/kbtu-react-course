import { Link } from 'react-router-dom';
import styles from './not-found-page.module.scss';

export function NotFoundPage() {
    return (
        <div className={styles.page}>
            <p className={styles.code}>404</p>
            <p className={styles.eyebrow}>SIGNAL LOST / ROUTE UNKNOWN</p>
            <h1>Page not found</h1>
            <p className={styles.lead}>
                The coordinates you requested are outside the mapped flight plan. The page may have moved, or the URL
                may be incorrect.
            </p>
            <div className={styles.actions}>
                <Link className={styles.primary} to='/'>
                    RETURN TO HOME
                </Link>
                <Link className={styles.secondary} to='/missions'>
                    OPEN MANIFEST
                </Link>
            </div>
        </div>
    );
}
