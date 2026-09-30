import { useState } from 'react';
import type { Mission } from '../../data/missions';
import { FUEL, INITIAL_CHECKS, STATUS } from '../../config/mission.config';
import styles from './mission-card.module.scss';

type MissionCardProps = {
    mission: Mission;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, status: Mission['status']) => void;
};

export const MissionCard = ({ mission, onDelete, onStatusChange }: MissionCardProps) => {
    const [fuel, setFuel] = useState<number>(FUEL.MAX);
    const [checks, setChecks] = useState(INITIAL_CHECKS);

    console.log(`MissionCard rendered: ${mission.name}`);

    const runCheck = () => {
        setFuel((current) => Math.max(FUEL.MIN, current - FUEL.COST_PER_CHECK));
        setChecks((current) => current + 1);
    };

    const resetSystem = () => {
        setFuel(FUEL.MAX);
        setChecks(INITIAL_CHECKS);
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
                {fuel <= FUEL.LOW_THRESHOLD && <small className={styles.warning}>LOW FUEL</small>}
            </div>
            <div className={styles.checks}>
                <span>SYSTEM CHECKS</span>
                <strong>{checks}</strong>
            </div>
            <div className={styles.actions}>
                <button onClick={runCheck} disabled={fuel === FUEL.MIN}>
                    RUN SYSTEM CHECK
                </button>
                {mission.status === STATUS.COMPLETED ? (
                    <span className={styles.complete}>MISSION COMPLETE</span>
                ) : (
                    <button onClick={() => onStatusChange(mission.id, STATUS.COMPLETED)}>MARK COMPLETE</button>
                )}
                <button className={styles.reset} onClick={resetSystem}>
                    RESET SYSTEM
                </button>
            </div>
        </article>
    );
};
