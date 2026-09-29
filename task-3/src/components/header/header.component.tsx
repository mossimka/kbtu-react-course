import styles from './header.module.scss';

type HeaderProps = { total: number; active: number; completed: number };

export const Header = ({ total, active, completed }: HeaderProps) => {
    return (
        <header className={styles.root}>
            <div className={styles.topline}><span>ORBITAL // MISSION CONTROL</span><span>UTC 14:32:08&nbsp;&nbsp; NETWORK: NOMINAL</span></div>
            <div className={styles.heading}><div><p className={styles.eyebrow}>DEEP SPACE OPERATIONS DASHBOARD</p><h1>Mission control</h1></div><div className={styles.signal}><span className={styles.dot} /> DEEP SPACE LINK ACTIVE</div></div>
            <div className={styles.stats}><div><strong>{String(total).padStart(2, '0')}</strong><span>MISSIONS</span></div><div><strong>{String(active).padStart(2, '0')}</strong><span>ACTIVE</span></div><div><strong>{String(completed).padStart(2, '0')}</strong><span>COMPLETED</span></div></div>
        </header>
    );
};