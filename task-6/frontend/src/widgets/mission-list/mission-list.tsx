import type { Mission } from '../../entities/mission/model/types';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { MissionCard } from '../../entities/mission/ui/mission-card';
import styles from './mission-list.module.scss';

type MissionListProps = {
    missions: Mission[];
    canManage: boolean;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, status: Mission['status']) => void;
};

export const MissionList = ({ missions, canManage, onDelete, onStatusChange }: MissionListProps) => (
    <>
        <div className={styles.toolbar}>
            <span>FLIGHT MANIFEST / {missions.length} VISIBLE</span>
        </div>
        {missions.length ? (
            <div className={styles.grid}>
                {missions.map((mission) => (
                    <MissionCard
                        key={mission.id}
                        mission={mission}
                        canManage={canManage}
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
