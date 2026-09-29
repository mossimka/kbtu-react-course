import { useState } from 'react';
import type { Mission } from '../../data/missions';
import styles from './mission-card.module.scss';

type MissionCardProps = {
    mission: Mission;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, status: Mission['status']) => void;
};

export const MissionCard = ({ mission, onDelete, onStatusChange }: MissionCardProps) => {
    const [fuel, setFuel] = useState(100);
    const [checks, setChecks] = useState(0);
    console.log(`MissionCard rendered: ${mission.name}`);

    const runCheck = () => {
        setFuel((current) => Math.max(0, current - 5));
        setChecks((current) => current + 1);
    };
    return (
        <article className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.missionIcon} aria-hidden='true'>
                    ✦
                </span>
                <div>
                    <h2>{mission.name}</h2>
                    <p>{mission.type}</p>
                </div>
                <span className={`${styles.status} ${styles[mission.status]}`}>
                    <i /> {mission.status}
                </span>
                <button
                    className={styles.delete}
                    onClick={() => onDelete(mission.id)}
                    aria-label={`Delete ${mission.name}`}
                >
                    ×
                </button>
            </div>
            <div className={styles.details}>
                <div>
                    <span>DESTINATION</span>
                    <strong>{mission.destination}</strong>
                </div>
                <div>
                    <span>CREW</span>
                    <strong>{mission.crew}</strong>
                </div>
                <div>
                    <span>PRIORITY</span>
                    <strong className={styles[mission.priority]}>{mission.priority}</strong>
                </div>
            </div>
            <div className={styles.fuel}>
                <div>
                    <span>FUEL RESERVES</span>
                    <strong>{fuel}%</strong>
                </div>
                <div className={styles.bar}>
                    <span style={{ width: `${fuel}%` }} />
                </div>
                {fuel <= 20 && <small className={styles.warning}>LOW FUEL</small>}
            </div>
            <div className={styles.checks}>
                <span>SYSTEM CHECKS</span>
                <strong>{checks}</strong>
            </div>
            <div className={styles.actions}>
                <button onClick={runCheck} disabled={fuel === 0}>
                    RUN SYSTEM CHECK
                </button>
                {mission.status === 'completed' ? (
                    <span className={styles.complete}>MISSION COMPLETE</span>
                ) : (
                    <button onClick={() => onStatusChange(mission.id, 'completed')}>MARK COMPLETE</button>
                )}
                <button
                    className={styles.reset}
                    onClick={() => {
                        setFuel(100);
                        setChecks(0);
                    }}
                >
                    RESET SYSTEM
                </button>
            </div>
        </article>
    );
};
