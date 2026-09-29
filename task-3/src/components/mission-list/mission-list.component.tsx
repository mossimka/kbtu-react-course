import type { Mission } from '../../data/missions';
import { EmptyState } from '../empty-state/empty-state.compnent';
import { MissionCard } from '../mission-card/mission-card.compoennt';
import styles from './mission-list.module.scss';

type MissionListProps = {
    missions: Mission[];
    resetVersion: number;
    onResetAll: () => void;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, status: Mission['status']) => void;
};

export const MissionList = ({ missions, resetVersion, onResetAll, onDelete, onStatusChange }: MissionListProps) => (
    <>
        <div className={styles.toolbar}>
            <span>FLIGHT MANIFEST / {missions.length} VISIBLE</span>
            <button onClick={onResetAll}>↻ RESET ALL SYSTEMS</button>
        </div>
        {missions.length ? (
            <div className={styles.grid}>
                {missions.map((mission) => (
                    <MissionCard
                        key={`${mission.id}-${resetVersion}`}
                        mission={mission}
                        onDelete={onDelete}
                        onStatusChange={onStatusChange}
                    />
                ))}
            </div>
        ) : (
            <EmptyState />
        )}
    </>
);
