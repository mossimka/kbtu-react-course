import { MOCK_UTC_TIME, STAT_PAD_CHAR, STAT_PAD_LENGTH } from '../../config/mission.config';
import styles from './header.module.scss';

type HeaderProps = { total: number; active: number; completed: number };

const formatStat = (value: number) => String(value).padStart(STAT_PAD_LENGTH, STAT_PAD_CHAR);

export const Header = ({ total, active, completed }: HeaderProps) => (
    <header className={styles.root}>
        <div className={styles.topline}>
            <span>ORBITAL // MISSION CONTROL</span>
            <span>UTC {MOCK_UTC_TIME}&nbsp;&nbsp; NETWORK: NOMINAL</span>
        </div>

        <div className={styles.heading}>
            <div>
                <p className={styles.eyebrow}>DEEP SPACE OPERATIONS DASHBOARD</p>
                <h1>Mission control</h1>
            </div>
            <div className={styles.signal}>
                <span className={styles.dot} /> DEEP SPACE LINK ACTIVE
            </div>
        </div>

        <div className={styles.stats}>
            <div>
                <strong>{formatStat(total)}</strong>
                <span>MISSIONS</span>
            </div>
            <div>
                <strong>{formatStat(active)}</strong>
                <span>ACTIVE</span>
            </div>
            <div>
                <strong>{formatStat(completed)}</strong>
                <span>COMPLETED</span>
            </div>
        </div>
    </header>
);
